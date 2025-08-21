import React, { useEffect, useState } from 'react';
import { axiosPrivate } from '../../API\'s/axios';
import '../../Css/Scheduled.css';
import socket from '../../utils/socket';

// Helper for formatting times like "14:30" to "2:30 PM"
function formatTime12h(timeStr) {
  if (!timeStr) return '-';
  const [hour, minute] = timeStr.split(':');
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const Scheduled = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on("scheduledUpdate", (data) => {
      if (data?.scheduleId) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === data.scheduleId ? { ...task, status: "completed" } : task
          )
        );
      }
    });

    return () => socket.off("scheduledUpdate");
  }, []);

  useEffect(() => {
    fetchScheduledTasks();
  }, []);

  const fetchScheduledTasks = async () => {
    try {
      const res = await axiosPrivate.get('/get-scheduled-tasks');
      setTasks(res.data.rows || []);
    } catch (err) {
      console.error('Error fetching scheduled tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (scheduleId) => {
    try {
      await axiosPrivate.post(`/update-schedule/${scheduleId}`);
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.schedule_id === scheduleId
            ? { ...task, is_active: task.is_active ? 0 : 1 }
            : task
        )
      );
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const deleteTask = async (scheduleId) => {
    const confirmed = window.confirm("Are you sure you want to delete this scheduled task?");
    if (!confirmed) return;

    try {
      await axiosPrivate.post(`/delete-schedule/${scheduleId}`);
      setTasks(prevTasks => prevTasks.filter(task => task.schedule_id !== scheduleId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="schedule-container">
      <h2 className="schedule-title">Your Scheduled Image Generations</h2>

      {loading ? (
        <div className="schedule-message schedule-message--info">
          Loading scheduled tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="schedule-message schedule-message--secondary">
          No scheduled tasks found.
        </div>
      ) : (
        <div className="schedule-grid">
          {tasks.map(task => (
            <div className="schedule-card" key={task.schedule_id}>
              <div className={`status-badge ${task.status === 'completed' ? 'completed' : 'pending'}`}>
                {task.status === 'completed' ? 'Completed' : 'Pending'}
              </div>

              <div className="schedule-card-body">
                <div className="schedule-prompt-wrapper">
                  <p className="schedule-prompt-label"><strong>Prompt:</strong></p>
                  <p className="schedule-prompt">{task.prompt}</p>
                </div>

                <div className="schedule-details">
                  {task.is_recurring ? (
                    <span className="schedule-badge">
                      Repeats: {task.frequency} at {formatTime12h(task.time)}
                    </span>
                  ) : (
                    <span className="schedule-badge schedule-badge--one">
                      One-time: {new Date(task.run_at).toLocaleString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour12: true
                      })}
                    </span>
                  )}
                </div>

                <div className="schedule-meta">
                  <span>Model: {task.model?.name || '-'}</span>
                  <span>Style: {task.style?.name || '-'}</span>
                  <span>Quality: {task.quality?.name || '-'}</span>
                  <span>Ratio: {task.aspect_ratio?.name || '-'}</span>
                </div>

                <div className="schedule-images">
                  Images per run: <strong>{task.images_per_run}</strong>
                </div>
              </div>

              <div className="schedule-actions">
                <button
                  className={`schedule-btn ${task.is_active ? 'schedule-btn--pause' : 'schedule-btn--resume'}`}
                  onClick={() => toggleTaskStatus(task.schedule_id)}
                  disabled={task.status === 'completed'}
                >
                  {task.is_active ? 'Pause' : 'Resume'}
                </button>
                <button
                  className="schedule-btn schedule-btn--delete"
                  onClick={() => deleteTask(task.schedule_id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scheduled;
