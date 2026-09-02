import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import PinMarker from '../components/PinMarker.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Spinner from '../components/Spinner.jsx';
import { api } from '../lib/api.js';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../App.jsx';

async function uploadToStorage(file, projectId) {
  const ext = file.name.split('.').pop();
  const path = `${projectId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from('files').upload(path, file, { upsert: false });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from('files').getPublicUrl(data.path);
  return { url: publicUrl, name: file.name };
}

function UploadZone({ projectId, onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef();

  async function handleFiles(files) {
    const file = files[0];
    if (!file) return;
    setErr(''); setUploading(true);
    try {
      const { url, name } = await uploadToStorage(file, projectId);
      const record = await api.post('/files', { project_id: projectId, file_url: url, file_name: name });
      onUploaded(record);
    } catch (e) { setErr(e.message || 'Upload failed.'); }
    finally { setUploading(false); }
  }

  return (
    <div
      style={{ border:`2px dashed ${dragging ? 'var(--teal)' : 'var(--sage)'}`, borderRadius:10, padding:'3rem 2rem', textAlign:'center', background: dragging ? 'rgba(31,111,99,.04)' : 'var(--white)', transition:'all .2s', cursor:'pointer' }}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
    >
      <input ref={inputRef} type="file" accept="image/*,.pdf" style={{ display:'none' }} onChange={e => handleFiles(e.target.files)} />
      {uploading ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'.75rem' }}><Spinner size={32} /><p style={{ color:'var(--text-muted)' }}>Uploading...</p></div>
      ) : (
        <>
          <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>{'\uD83D\uDCCE'}</div>
          <p style={{ fontWeight:600, marginBottom:'.25rem' }}>Drop a file here, or click to browse</p>
          <p style={{ fontSize:'.875rem', color:'var(--text-muted)' }}>Images (PNG, JPG, WebP) or PDFs</p>
          {err && <p style={{ color:'#c0392b', marginTop:'.75rem', fontSize:'.875rem' }}>{err}</p>}
        </>
      )}
    </div>
  );
}

function CommentThread({ comments, activePin, onPinClick }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'.625rem' }}>
      {comments.map((c, i) => (
        <div key={c.id} onClick={() => onPinClick(activePin === c.id ? null : c.id)}
          style={{ background: activePin === c.id ? '#f0f5f4' : 'var(--white)', border: `1px solid ${activePin === c.id ? 'var(--teal)' : 'var(--sage)'}`, borderRadius:8, padding:'10px 12px', cursor:'pointer', transition:'all .15s' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background: i % 2 === 0 ? 'var(--teal)' : 'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.6rem', fontWeight:700, color:'#fff', flexShrink:0 }}>
              {(c.author_name || 'U').substring(0,2).toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'.75rem', fontWeight:600 }}>{c.author_name || 'Unknown'}</div>
              <div style={{ fontSize:'.625rem', color:'var(--text-subtle)' }}>{new Date(c.created_at).toLocaleString()}</div>
            </div>
            <div style={{ width:16, height:16, borderRadius:'50%', background: i % 2 === 0 ? 'var(--teal)' : 'var(--amber)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.5rem', fontWeight:700, color:'#fff' }}>{i+1}</div>
          </div>
          <p style={{ fontSize:'.8rem', color:'#4a5254', lineHeight:1.5 }}>{c.body}</p>
        </div>
      ))}
    </div>
  );
}

export default function Project() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [comments, setComments] = useState([]);
  const [activePin, setActivePin] = useState(null);
  const [pendingPin, setPendingPin] = useState(null);
  const [commentBody, setCommentBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    api.get(`/projects/${id}`).then(p => {
      setProject(p);
      const fs = p.files || [];
      setFiles(fs);
      if (fs.length > 0) { setActiveFile(fs[0]); loadComments(fs[0].id); }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  async function loadComments(fileId) {
    const c = await api.get(`/comments?file_id=${fileId}`);
    setComments(c);
  }

  // Realtime comments
  useEffect(() => {
    if (!activeFile) return;
    const channel = supabase
      .channel(`comments-${activeFile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `file_id=eq.${activeFile.id}` },
        payload => setComments(prev => prev.some(c => c.id === payload.new.id) ? prev : [...prev, payload.new])
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [activeFile?.id]);

  const handleFileClick = useCallback((e) => {
    if (project?.status === 'approved') return;
    const rect = fileRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pin_x = ((e.clientX - rect.left) / rect.width) * 100;
    const pin_y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x: pin_x, y: pin_y });
    setActivePin(null);
    setCommentBody('');
  }, [project?.status]);

  async function submitComment(e) {
    e.preventDefault();
    if (!pendingPin || !commentBody.trim()) return;
    setPosting(true);
    try {
      const c = await api.post('/comments', {
        file_id: activeFile.id, pin_x: pendingPin.x, pin_y: pendingPin.y,
        body: commentBody.trim(), author_name: profile?.name || profile?.email,
      });
      setComments(prev => [...prev, c]);
      setPendingPin(null); setCommentBody(''); setActivePin(c.id);
    } catch (e) { setErr(e.message); }
    finally { setPosting(false); }
  }

  async function handleApprove() {
    if (!confirm('Mark this project as approved?')) return;
    setApproving(true);
    try {
      await api.post('/approvals', { project_id: id, approved_by_name: profile?.name || profile?.email });
      setProject(p => ({ ...p, status: 'approved' }));
    } catch (e) { setErr(e.message); }
    finally { setApproving(false); }
  }

  function handleFileUploaded(record) {
    setFiles(prev => [record, ...prev]);
    setActiveFile(record); setComments([]);
  }

  if (loading) return <Layout><div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><Spinner size={32} /></div></Layout>;
  if (!project) return <Layout><div className="container" style={{ padding:'3rem 0', color:'var(--text-muted)' }}>Project not found. <Link to="/dashboard" style={{ color:'var(--teal)' }}>Back</Link></div></Layout>;

  const isApproved = project.status === 'approved';
  const approval = project.approvals?.[0];

  return (
    <Layout>
      <div className="container" style={{ paddingBlock:'clamp(1.5rem,4vw,2.5rem)' }}>
        <div style={{ marginBottom:'1.5rem' }}>
          <Link to="/dashboard" style={{ fontSize:'.8125rem', color:'var(--text-muted)', marginBottom:'.75rem', display:'inline-block' }}>&larr; Dashboard</Link>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
            <div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.4rem,3vw,2rem)', fontWeight:600, letterSpacing:'-.02em', marginBottom:'.25rem' }}>{project.name}</h1>
              {project.client_name && <p style={{ color:'var(--text-muted)', fontSize:'.9rem' }}>Client: {project.client_name}</p>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', flexWrap:'wrap' }}>
              <StatusBadge status={project.status} />
              {!isApproved && <button className="btn btn-primary btn-sm" onClick={handleApprove} disabled={approving}>{approving ? 'Approving\u2026' : '\u2713 Mark as approved'}</button>}
            </div>
          </div>
        </div>

        {isApproved && approval && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#ecf7f0', border:'1px solid #a8d9b5', borderRadius:20, padding:'6px 14px', fontSize:'.8125rem', fontWeight:600, color:'#1a6632', marginBottom:'1.5rem' }}>
            <div style={{ width:16, height:16, background:'#2e8b4f', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:8, height:6, borderLeft:'2px solid #fff', borderBottom:'2px solid #fff', transform:'rotate(-45deg) translate(.5px,-.5px)' }}></div>
            </div>
            Approved by {approval.approved_by_name} &bull; {new Date(approval.approved_at).toLocaleString()}
          </div>
        )}

        {err && <div style={{ background:'#fdf0ef', border:'1px solid #f5c0bb', borderRadius:6, padding:'.75rem 1rem', marginBottom:'1rem', fontSize:'.875rem', color:'#c0392b' }}>{err}</div>}

        <div style={{ display:'grid', gridTemplateColumns: activeFile ? '1fr 320px' : '1fr', gap:'1.5rem', alignItems:'start' }}>
          <div>
            {files.length > 1 && (
              <div style={{ display:'flex', gap:'.5rem', marginBottom:'1rem', flexWrap:'wrap' }}>
                {files.map(f => (
                  <button key={f.id} onClick={() => { setActiveFile(f); loadComments(f.id); setPendingPin(null); }}
                    style={{ padding:'.4rem .875rem', borderRadius:20, border:'var(--sage-line)', background: activeFile?.id===f.id ? 'var(--teal)' : 'var(--white)', color: activeFile?.id===f.id ? '#fff' : 'var(--ink)', fontSize:'.8125rem', fontWeight:500, cursor:'pointer' }}>
                    {f.file_name || 'File'}
                  </button>
                ))}
              </div>
            )}

            {activeFile ? (
              <div style={{ position:'relative', background:'var(--white)', border:'var(--sage-line)', borderRadius:10, overflow:'hidden', cursor: isApproved ? 'default' : 'crosshair' }} onClick={handleFileClick}>
                <div ref={fileRef} style={{ position:'relative', lineHeight:0 }}>
                  {activeFile.file_url.match(/\.pdf$/i) ? (
                    <iframe src={activeFile.file_url} title="File" style={{ width:'100%', height:'70vh', border:'none' }} />
                  ) : (
                    <img src={activeFile.file_url} alt="Design file" style={{ width:'100%', height:'auto', display:'block', maxHeight:'70vh', objectFit:'contain', background:'#f4f3ef' }} />
                  )}
                  {comments.map((c, i) => <PinMarker key={c.id} pin={c} index={i} isActive={activePin === c.id} onClick={setActivePin} />)}
                  {pendingPin && <div style={{ position:'absolute', left:`${pendingPin.x}%`, top:`${pendingPin.y}%`, width:24, height:24, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg) translate(-50%,-50%)', background:'var(--amber)', border:'2px solid #fff', boxShadow:'0 2px 8px rgba(0,0,0,.2)', zIndex:20, pointerEvents:'none' }} />}
                </div>
              </div>
            ) : (
              <UploadZone projectId={id} onUploaded={handleFileUploaded} />
            )}

            {activeFile && !isApproved && <div style={{ marginTop:'1rem' }}><UploadZone projectId={id} onUploaded={handleFileUploaded} /></div>}
            {!isApproved && <p style={{ marginTop:'.75rem', fontSize:'.8125rem', color:'var(--text-subtle)' }}>{activeFile ? 'Click anywhere on the file to drop a comment pin.' : 'Upload a file above to start.'}</p>}
          </div>

          {activeFile && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {pendingPin && (
                <div className="card" style={{ padding:'1.25rem' }}>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, marginBottom:'1rem' }}>Add comment</h3>
                  <form onSubmit={submitComment}>
                    <textarea autoFocus required className="form-input" style={{ resize:'vertical', minHeight:80 }} placeholder="What's your comment?" value={commentBody} onChange={e => setCommentBody(e.target.value)} />
                    <div style={{ display:'flex', gap:'.5rem', marginTop:'.75rem' }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={posting}>{posting ? 'Posting\u2026' : 'Post comment'}</button>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPendingPin(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}
              <div className="card" style={{ padding:'1.25rem' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:600, marginBottom:'1rem' }}>Comments <span style={{ fontWeight:400, fontSize:'.875rem', color:'var(--text-muted)' }}>({comments.length})</span></h3>
                {comments.length === 0 ? (
                  <p style={{ fontSize:'.875rem', color:'var(--text-muted)', lineHeight:1.6 }}>{isApproved ? 'This project was approved.' : 'No comments yet. Click on the file to drop a pin.'}</p>
                ) : (
                  <CommentThread comments={comments} activePin={activePin} onPinClick={setActivePin} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
