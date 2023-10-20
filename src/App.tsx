import { useEffect, useState } from "react";
import { useAnimatedState, MotionItem } from "./motion";

function App() {
  const [todos, setTodos] = useAnimatedState([
    "Learn about animation",
    "Ship 1 page checkout",
  ]);

  function addTodo(value: string) {
    setTodos((prev) => [value, ...prev]);
  }

  return (
    <main>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = event.target as HTMLFormElement & {
            elements: { todo: HTMLInputElement };
          };

          addTodo(form.elements.todo.value);
          form.reset();
        }}
      >
        <input
          type="text"
          name="todo"
          autoComplete="off"
          placeholder="New todo…"
        />

        <button className="NewButton" type="submit">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            style={{ width: 12, height: 12 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </form>
      <ul>
        {todos.map((todo) => (
          <MotionItem key={todo} id={todo}>
            <Todo
              content={todo}
              onDone={() => {
                setTodos((prev) => prev.filter((item) => item !== todo));
              }}
            />
          </MotionItem>
        ))}
      </ul>
    </main>
  );
}

function Todo({ content, onDone }: { content: string; onDone(): void }) {
  const [deleting, setDeleting] = useState(false);
  const [active, setActive] = useAnimatedState(false);

  useEffect(() => {
    if (!deleting) return;

    const id = setTimeout(() => {
      onDone();
    }, 1000);

    return () => {
      clearTimeout(id);
    };
  }, [deleting]);

  return (
    <li>
      <div className="ContentRow">
        <input
          type="checkbox"
          onChange={(event) => {
            setDeleting(event.currentTarget.checked);
          }}
        />
        <button
          className="ContentButton"
          onClick={() => {
            setActive(!active);
          }}
        >
          {content}
        </button>
      </div>
      {active && (
        <div className="Controls">
          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0M10.5 8.25h3l-3 4.5h3"
              />
            </svg>
            Snooze
          </button>

          <button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            Archive
          </button>
        </div>
      )}
    </li>
  );
}

export default App;
