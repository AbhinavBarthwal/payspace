/**
 * CategoryManager — full category CRUD stored in localStorage
 *
 * Exports:
 *   useCategories()         — hook: { categories, addCategory, deleteCategory }
 *   CategoryPicker          — inline picker for Transfer / AddFunds forms
 *   CategoryManagerModal    — full management modal (add + delete)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, X, Trash2, Check, Settings2 } from 'lucide-react';

/* ── default built-in categories ── */
const DEFAULTS = [
  { id: 'peer-transfer', name: 'Peer Transfer',  emoji: '💸', builtin: true },
  { id: 'top-up',        name: 'Top Up',          emoji: '🏦', builtin: true },
  { id: 'food',          name: 'Food & Dining',   emoji: '🍔', builtin: false },
  { id: 'shopping',      name: 'Shopping',        emoji: '🛍️', builtin: false },
  { id: 'transport',     name: 'Transport',       emoji: '🚗', builtin: false },
  { id: 'utilities',     name: 'Utilities',       emoji: '⚡', builtin: false },
  { id: 'entertainment', name: 'Entertainment',   emoji: '🎮', builtin: false },
  { id: 'health',        name: 'Health',          emoji: '💊', builtin: false },
  { id: 'education',     name: 'Education',       emoji: '📚', builtin: false },
  { id: 'savings',       name: 'Savings',         emoji: '🏺', builtin: false },
  { id: 'rent',          name: 'Rent',            emoji: '🏠', builtin: false },
  { id: 'travel',        name: 'Travel',          emoji: '✈️', builtin: false },
  { id: 'gifts',         name: 'Gifts',           emoji: '🎁', builtin: false },
  { id: 'other',         name: 'Other',           emoji: '🔖', builtin: false },
];

const EMOJIS = ['💸','🍔','🛍️','🚗','⚡','🎮','💊','📚','🏺','🏠','✈️','🎁','🔖','☕','🎵','🏋️','💇','🐾','🧴','🎨','💰','🤝','📱','🖥️'];

const STORAGE_KEY = 'payspace_categories';

function loadCategories() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) return saved;
  } catch {}
  return DEFAULTS;
}

function saveCategories(cats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

/* ── hook ── */
export function useCategories() {
  const [categories, setCategories] = useState(loadCategories);

  const addCategory = (name, emoji) => {
    if (!name.trim()) return;
    const id = `custom-${Date.now()}`;
    const next = [...categories, { id, name: name.trim(), emoji: emoji || '🔖', builtin: false }];
    setCategories(next);
    saveCategories(next);
  };

  const deleteCategory = (id) => {
    const next = categories.filter(c => c.id !== id || c.builtin);
    setCategories(next);
    saveCategories(next);
  };

  return { categories, addCategory, deleteCategory };
}

/* ══════════════════════════════════════════════════════
   CategoryPicker — compact inline picker with manage button
══════════════════════════════════════════════════════ */
export function CategoryPicker({ selected, onChange, categories, onManage }) {
  const [open, setOpen] = useState(false);
  const current = categories.find(c => c.name === selected);

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={() => setOpen(o => !o)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14, padding: '12px 16px', cursor: 'pointer',
            color: selected ? '#fff' : 'rgba(255,255,255,0.35)',
            transition: 'all 0.2s',
          }}
        >
          <Tag size={16} style={{ color: '#a78bfa', flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: 14, flex: 1, textAlign: 'left' }}>
            {current ? `${current.emoji} ${current.name}` : 'Select category…'}
          </span>
          {selected && (
            <button type="button" onClick={e => { e.stopPropagation(); onChange(''); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, display: 'flex' }}
            ><X size={14} /></button>
          )}
        </button>
        <button type="button" onClick={onManage} title="Manage categories"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', transition: 'all 0.2s' }}
        >
          <Settings2 size={16} />
        </button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
              background: 'rgba(10,15,40,0.98)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 18, padding: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(24px)',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4,
              maxHeight: 280, overflowY: 'auto',
            }}
          >
            {categories.map(cat => (
              <button key={cat.id} type="button"
                onClick={() => { onChange(cat.name); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                  background: selected === cat.name ? 'rgba(124,58,237,0.2)' : 'transparent',
                  border: `1px solid ${selected === cat.name ? 'rgba(124,58,237,0.4)' : 'transparent'}`,
                  color: selected === cat.name ? '#a78bfa' : 'rgba(255,255,255,0.75)',
                  fontWeight: 600, fontSize: 13, textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.name}</span>
                {selected === cat.name && <Check size={13} style={{ flexShrink: 0 }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click-outside close */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CategoryManagerModal — full add / delete UI
══════════════════════════════════════════════════════ */
export function CategoryManagerModal({ open, onClose, categories, onAdd, onDelete }) {
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🔖');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!open) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim(), newEmoji);
    setNewName('');
    setNewEmoji('🔖');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 24 }}
        style={{
          position: 'relative', zIndex: 10, width: '100%', maxWidth: 520,
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          background: 'rgba(8,14,40,0.98)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(32px)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 12, padding: 8, display: 'flex' }}>
              <Tag size={18} style={{ color: '#a78bfa' }} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>Manage Categories</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{categories.length} categories</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Add new */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Add New Category</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Emoji picker button */}
            <div style={{ position: 'relative' }}>
              <button type="button" onClick={() => setShowEmojiPicker(o => !o)}
                style={{ width: 48, height: 48, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {newEmoji}
              </button>
              <AnimatePresence>
                {showEmojiPicker && (
                  <>
                    <div onClick={() => setShowEmojiPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 5 }} />
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 10, background: 'rgba(10,15,40,0.98)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 4, width: 240, boxShadow: '0 16px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(24px)' }}
                    >
                      {EMOJIS.map(e => (
                        <button key={e} type="button" onClick={() => { setNewEmoji(e); setShowEmojiPicker(false); }}
                          style={{ fontSize: 20, padding: 6, borderRadius: 8, border: `1px solid ${newEmoji === e ? 'rgba(124,58,237,0.5)' : 'transparent'}`, background: newEmoji === e ? 'rgba(124,58,237,0.15)' : 'transparent', cursor: 'pointer' }}
                        >{e}</button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <input
              type="text" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Category name…"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px', color: '#fff', fontSize: 14, fontWeight: 600, outline: 'none' }}
            />
            <button type="button" onClick={handleAdd} disabled={!newName.trim()}
              style={{ padding: '12px 18px', borderRadius: 12, background: '#7c3aed', border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: newName.trim() ? 1 : 0.4, transition: 'opacity 0.2s' }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Category list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
          <AnimatePresence>
            {categories.map(cat => (
              <motion.div key={cat.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12, height: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 14, marginBottom: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{cat.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: cat.builtin ? 'rgba(255,255,255,0.45)' : '#fff' }}>{cat.name}</span>
                  {cat.builtin && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>built-in</span>
                  )}
                </div>
                {!cat.builtin && (
                  deleteTarget === cat.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { onDelete(cat.id); setDeleteTarget(null); }}
                        style={{ fontSize: 12, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
                      >Confirm</button>
                      <button onClick={() => setDeleteTarget(null)}
                        style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}
                      >Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteTarget(cat.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', padding: 4, display: 'flex', borderRadius: 8, transition: 'color 0.2s' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
