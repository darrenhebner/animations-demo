import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState(['Learn about animation', 'Ship 1 page checkout']);
  const [active, setActive] = useState<number | undefined>(undefined);

  function addTodo(value: string) {
    setTodos((prev) => [value, ...prev]);
    setActive(0);
  }

  return (
    <main>
      <form onSubmit={event => {
        event.preventDefault();
        console.log(event)
        addTodo(event.target.elements.todo.value);
        event.target.reset();
      }}>
        <input type="text" name="todo" />
        <button className="NewButton" type="submit">New Todo</button>
      </form>
      <ul>
        {todos.map((todo, index) => (
          <Todo
            key={todo}
            active={active === index}
            content={todo}
            onSelect={() => {
              setActive(index);
            }}
            onDone={() => {
              setTodos(prev => prev.filter(item => item !== todo))
              setActive(undefined);
            }}
          />
        ))}
      </ul>
    </main>
  )
}

function Todo({ active, content, onDone, onSelect }: { active: boolean; content: string, onDone(): void, onSelect(): void }) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!deleting) return;

    const id = setTimeout(() => {
      onDone()
    }, 1000);

    return () => {
      clearTimeout(id);
    }
  }, [deleting])

  return (
    <li className={active ? 'Active' : ''}>
      <div className='ContentRow'>
        <input type="checkbox" onChange={(event => {
            setDeleting(event.currentTarget.checked)
        })} />
        <button className="ContentButton" onClick={onSelect}>{content}</button>
      </div>
      {active && <div className="Controls">
        <button>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M10.5 8.25h3l-3 4.5h3" />
          </svg>
          Snooze
        </button>
      </div>}
    </li>
  )
}

export default App
