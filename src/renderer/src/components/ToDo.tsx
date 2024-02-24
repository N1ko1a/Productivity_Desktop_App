import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AiFillDelete, AiOutlineCheck, AiFillEdit } from 'react-icons/ai'

function ToDo(): JSX.Element {
  const [tasks, setTasks] = useState([])
  const [inputTask, setInputTask] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [editableId, setEditableId] = useState(null)
  const [editableValue, setEditablelValue] = useState('')
  const [complited, setComplited] = useState(false)
  const [change, setChange] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    setIsLoading(true)
    const apiURL = `http://localhost:3000/todo`
    fetch(apiURL)
      .then((res) => res.json())
      .then((data) => {
        const todoResult = data || []
        let count = 0
        todoResult.map((task) => {
          if (task.Compleated === true) {
            count += 1
          }
        })
        if (count > 0) {
          setComplited(true)
        } else {
          setComplited(false)
        }

        setTasks(todoResult)
        setIsLoading(false)
      })
      .catch((error) => {
        console.log('Error: Ne mogu da uzmem podatke', error)
        setIsLoading(false)
      })
    setChange(false)
    if (editableId === null) return // No need to focus if editableId is null
    if (ref.current) {
      ref.current.focus()
    }
  }, [change, editableId])

  const handleInputTask = (event) => {
    setInputTask(event.target.value)
  }
  const handleInputTaskUpdate = (event) => {
    setEditablelValue(event.target.value)
  }

  const handleCheckBoxChange = async (e, taskId) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Compleated: e.target.checked
        })
      })
      const data = await response.json()

      if (response.ok) {
        setEditableId(null)
        setChange(true)
        console.log('Uspesno promenjen compleated')
      }
    } catch (error) {
      console.error('An unexpected error occurred', error)
    }
  }

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      try {
        const response = await fetch('http://localhost:3000/todo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Content: inputTask
          })
        })
        const data = await response.json()

        if (response.ok) {
          console.log(data.message)
          setInputTask('')
          setChange(true)
        }
      } catch (error) {
        console.error('An unexpected error occurred', error)
      }
    }
  }
  const handleKeyDownUpdate = async (event, taskId) => {
    if (event.key === 'Enter') {
      try {
        const response = await fetch(`http://localhost:3000/todo/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Content: editableValue
          })
        })
        const data = await response.json()

        if (response.ok) {
          setEditableId(null)
          setChange(true)
          console.log(data.message)
        }
      } catch (error) {
        console.error('An unexpected error occurred', error)
      }
    }
  }
  const handleDelete = async (index) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/${index}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      const data = await response.json()

      if (response.ok) {
        console.log(data.message)
        setChange(true)
      }
    } catch (error) {
      console.error('An unexpected error occurred', error)
    }
  }

  const handleUpdate = (task) => {
    setEditableId(task._id)
    setEditablelValue(task.Content)
  }
  return (
    <div className="bg-black/40 w-1/4 h-2/3 rounded-2xl backdrop-blur-sm flex flex-col justify-between items-center">
      <div className="flex w-11/12 h-10 bg-gray/30  backdrop-blur-sm hover:bg-black/25  transition duration-500 ease-in-out rounded-lg mt-5">
        <input
          type="text"
          placeholder="Add Task"
          value={inputTask}
          onChange={handleInputTask}
          onKeyDown={handleKeyDown}
          className="w-full h-full  bg-transparent rounded-lg text-white pl-4 outline-none    "
        />
      </div>
      <div
        className={`flex flex-col bg-transparent overflow-auto scrollbar-none  w-11/12 ${complited ? 'h-1/2' : 'h-full'}  mt-5 mb-5 rounded-lg `}
      >
        <AnimatePresence>
          {tasks.map(
            (task) =>
              !task.Compleated && (
                <motion.div
                  key={task._id}
                  className="flex justify-between p-2 w-full h-10 bg-gray/30  backdrop-blur-sm rounded-lg text-white  mt-1 mb-1  "
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1,
                    ease: [0, 0.71, 0.2, 1.01]
                  }}
                >
                  <div className="flex w-fit  justify-center items-center ">
                    <label className="cursor-pointer relative">
                      <input
                        type="checkbox"
                        onChange={(e) => handleCheckBoxChange(e, task._id)}
                        checked={task.Compleated}
                        className=" h-5 w-5 border-2 border-gray-200 appearance-none hover:border-gray-600 transition duration-500 ease-in-out  rounded-md mr-2 mt-1"
                      />
                      <AiOutlineCheck
                        className={`h-5 w-5 text-gray-200 hover:text-gray-600 transition duration-500 ease-in-out absolute left-0 top-1 ${task.Compleated ? 'text-opacity-100' : 'text-opacity-0'}`}
                      />
                    </label>
                    {editableId == task._id ? (
                      <input
                        ref={ref}
                        type="text"
                        placeholder={task.Content}
                        value={editableValue}
                        onChange={handleInputTaskUpdate}
                        onKeyDown={(event) => handleKeyDownUpdate(event, task._id)} // Pass event and task id
                        onBlur={() => setEditableId(null)}
                        className="w-full h-full bg-transparent rounded-lg text-white pl-4 outline-none"
                      />
                    ) : (
                      <h1 className="text-gray-200">{task.Content}</h1>
                    )}
                  </div>
                  <div className="flex  w-fit h-full">
                    <button onClick={() => handleUpdate(task)}>
                      <AiFillEdit className="flex justify-center items-center mr-2 hover:text-gray-700 transition duration-500 ease-in-out" />
                    </button>
                    <button onClick={() => handleDelete(task._id)}>
                      <AiFillDelete className="flex justify-center items-center hover:text-gray-700 transition duration-500 ease-in-out" />
                    </button>
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
      {complited ? (
        <div
          className={`flex flex-col bg-transparent overflow-auto scrollbar-none  w-11/12 h-1/2 mt-5 mb-5 rounded-lg `}
        >
          <AnimatePresence>
            {tasks.map(
              (task) =>
                task.Compleated && (
                  <motion.div
                    key={task._id}
                    className="flex justify-between p-2 w-full h-10 bg-gray/30  backdrop-blur-sm rounded-lg text-white  mt-1 mb-1"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.1,
                      ease: [0, 0.71, 0.2, 1.01]
                    }}
                  >
                    <div className="flex w-fit  justify-center items-center ">
                      <label className="cursor-pointer relative">
                        <input
                          type="checkbox"
                          onChange={(e) => handleCheckBoxChange(e, task._id)}
                          checked={task.Compleated}
                          className=" h-5 w-5 border-2 border-gray-500 appearance-none hover:border-gray-600 transition duration-500 ease-in-out  rounded-md mr-2 mt-1"
                        />
                        <AiOutlineCheck
                          className={`h-5 w-5 text-gray-500 hover:text-gray-600 transition duration-500 ease-in-out absolute left-0 top-1 ${task.Compleated ? 'text-opacity-100' : 'text-opacity-0'}`}
                        />
                      </label>
                      {editableId == task._id ? (
                        <input
                          ref={ref}
                          type="text"
                          placeholder={task.Content}
                          value={editableValue}
                          onChange={handleInputTaskUpdate}
                          onKeyDown={(event) => handleKeyDownUpdate(event, task._id)} // Pass event and task id
                          onBlur={() => setEditableId(null)}
                          className="w-full h-full bg-transparent rounded-lg text-white pl-4 outline-none"
                        />
                      ) : (
                        <h1 className="text-gray-500 line-through">{task.Content}</h1>
                      )}
                    </div>
                    <div className="flex  w-fit h-full">
                      <button onClick={() => handleUpdate(task)}>
                        <AiFillEdit className="flex justify-center text-gray-500 items-center mr-2 hover:text-gray-700 transition duration-500 ease-in-out" />
                      </button>
                      <button onClick={() => handleDelete(task._id)}>
                        <AiFillDelete className="flex justify-center text-gray-500 items-center hover:text-gray-700 transition duration-500 ease-in-out" />
                      </button>
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  )
}
export default ToDo
