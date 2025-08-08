// src/pages/scheduled.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { axiosPrivate } from '../../API\'s/axios';

const ScheduledTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user’s scheduled tasks on load
  useEffect(() => {
    fetchScheduledTasks();
  }, []);

  const fetchScheduledTasks = async () => {
    try {
      const res = await axiosPrivate.get('/get-scheduled-tasks', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}` // if needed
        }
      });
      console.log("Tasks fetched:", res.data);
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
      fetchScheduledTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const deleteTask = async (scheduleId) => {
    try {
      await axiosPrivate.post(`/delete-schedule/${scheduleId}`);
      fetchScheduledTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Scheduled Image Generations</h2>

      {loading ? (
        <div className="alert alert-info">Loading scheduled tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="alert alert-secondary">No scheduled tasks found.</div>
      ) : (
        <div className="row">
          {tasks.map(task => (
            <div className="col-md-6 mb-4" key={task.schedule_id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{task.prompt}</h5>
                  <p className="card-text">
                    {task.is_recurring
                      ? `Repeats: ${task.frequency} at ${task.time}`
                      : `One-time: ${new Date(task.run_at).toLocaleString()}`}
                  </p>
                  <p className="card-text text-muted">
                    Style: {task.style || '-'} | Quality: {task.quality || '-'} | Ratio: {task.aspect_ratio || '-'}
                  </p>
                  <p className="card-text">Images per run: {task.images_per_run}</p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <button
                    className={`btn ${task.is_active ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => toggleTaskStatus(task.schedule_id)}
                  >
                    {task.is_active ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteTask(task.schedule_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledTasksPage;
