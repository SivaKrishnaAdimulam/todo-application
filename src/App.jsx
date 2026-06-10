import { useState, useEffect } from 'react';
import './App.css';

const FILTERS    = ['All', 'Active', 'Done'];
const PRIORITIES = ['high', 'medium', 'low'];

const formatDate = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
    ' · ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const PRIORITY_EMOJI = { high: '🔴', medium: '🟠', low: '🟢' };

export default function App() {
  const [todos, setTodos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nb-todos') || '[]'); }
    catch { return []; }
  });
  const [input,    setInput]    = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter,   setFilter]   = useState('All');

  useEffect(() => {
    localStorage.setItem('nb-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos(prev => [{ id: Date.now(), text, priority, completed: false, date: formatDate() }, ...prev]);
    setInput('');
  };

  const toggle = id => setTodos(p => p.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const remove = id => setTodos(p => p.filter(t => t.id !== id));
  const clearDone = () => setTodos(p => p.filter(t => !t.completed));

  const filtered = todos.filter(t => {
    if (filter === 'Active') return !t.completed;
    if (filter === 'Done')   return t.completed;
    return true;
  });

  const doneCount   = todos.filter(t =>  t.completed).length;
  const activeCount = todos.filter(t => !t.completed).length;
  const progress    = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;

  const countFor = f => f === 'All' ? todos.length : f === 'Active' ? activeCount : doneCount;

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="header">
        <div className="header-tag">✦ Task Manager</div>
        <h1>MY TODO<br /><span>LIST.</span></h1>
        <p className="header-sub">Stay brutal. Stay productive.</p>
      </header>

      {/* ── Stats ── */}
      <div className="stats-row">
        <div className="stat-pill">
          <span className="stat-num">{todos.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-pill active">
          <span className="stat-num">{activeCount}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-pill done">
          <span className="stat-num">{doneCount}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {/* ── Main Card ── */}
      <main className="card">

        {/* Input */}
        <div className="input-section">
          <label className="input-label" htmlFor="todo-input">+ Add new task</label>
          <div className="input-row">
            <input
              id="todo-input"
              className="todo-input"
              type="text"
              placeholder="What needs to be done?"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
            />
            <button id="add-btn" className="add-btn" onClick={addTodo}>
              ADD →
            </button>
          </div>
        </div>

        {/* Priority */}
        <div className="priority-row">
          {PRIORITIES.map(p => (
            <button
              key={p}
              id={`priority-${p}`}
              className={`priority-btn ${priority === p ? `sel-${p}` : ''}`}
              onClick={() => setPriority(p)}
            >
              {PRIORITY_EMOJI[p]} {p}
            </button>
          ))}
        </div>

        <div className="divider" />

        {/* Progress */}
        {todos.length > 0 && (
          <div className="progress-section">
            <div className="progress-header">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filter-row">
          {FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f} <span className="count">{countFor(f)}</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="todo-list" id="todo-list">
          {filtered.length === 0 ? (
            <div className="empty">
              <span className="empty-icon">{filter === 'Done' ? '🎉' : '📋'}</span>
              <p>{filter === 'Done' ? 'Nothing done yet' : 'No tasks here'}</p>
            </div>
          ) : (
            filtered.map(todo => (
              <div
                key={todo.id}
                className={`todo-item p-${todo.priority} ${todo.completed ? 'completed' : ''}`}
              >
                {/* Checkbox */}
                <button
                  className={`nb-checkbox ${todo.completed ? 'checked' : ''}`}
                  onClick={() => toggle(todo.id)}
                  aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {todo.completed && '✓'}
                </button>

                {/* Content */}
                <div className="todo-body">
                  <div className="todo-text">{todo.text}</div>
                  <div className="todo-meta">
                    <span className={`priority-tag ${todo.priority}`}>{todo.priority}</span>
                    <span className="todo-date">{todo.date}</span>
                  </div>
                </div>

                {/* Delete */}
                <button
                  className="delete-btn"
                  onClick={() => remove(todo.id)}
                  aria-label="Delete task"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="footer-row">
            <span className="remaining-txt">
              <strong>{activeCount}</strong> task{activeCount !== 1 ? 's' : ''} left
            </span>
            {doneCount > 0 && (
              <button id="clear-done-btn" className="clear-btn" onClick={clearDone}>
                Clear done ✕
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
