const cron = require('node-cron');

// cron.schedule('* * * * *', async () => {
//   const now = new Date();
//   const currentTime = now.toTimeString().slice(0, 5); 
//   const currentDate = now.toISOString().split("T")[0]; 
//   const currentDateTime = now.toISOString().slice(0, 16).replace("T", " "); 

//   const [schedules] = await db.execute(`
//     SELECT * FROM scheduled_image_prompts
//     WHERE is_active = 1
//   `);

//   const schedulesToRun = schedules.filter(schedule => {
//     if (schedule.is_recurring) {
//       if (schedule.time !== currentTime) return false;

//       const createdAt = new Date(schedule.created_at);
//       const frequency = schedule.frequency;

//       switch (frequency) {
//         case 'daily':
//           return true;
//         case 'weekly':
//           return now.getDay() === createdAt.getDay(); 
//         case 'monthly':
//           return now.getDate() === createdAt.getDate();
//         default:
//           return false;
//       }
//     } else {
//       // One-time run
//       const runAt = new Date(schedule.run_at).toISOString().slice(0, 16).replace("T", " ");
//       return runAt === currentDateTime;
//     }
//   });

//   for (const schedule of schedulesToRun) {
//     for (let i = 0; i < schedule.images_per_run; i++) {
//       await generateImage({
//         user_id: schedule.user_id,
//         prompt: schedule.prompt,
//         model: schedule.model,
//         aspect_ratio: schedule.aspect_ratio,
//         quality: schedule.quality,
//         style: schedule.style,
//         resolution: schedule.resolution,
//         chat_id: null,
//         use_context: false
//       });
//     }

//     if (!schedule.is_recurring) {
//       await db.execute(`
//         UPDATE scheduled_image_prompts SET is_active = 0 WHERE schedule_id = ?`,
//         [schedule.schedule_id]
//       );
//     }
//   }
// });
  
cron.schedule('* * * * *', async() => {
  console.log("checking schedule generation2")
  const [recurringSchedules] = await db.execute(`
    SELECT * FROM scheduled_image_prompts
    WHERE is_recurring = 1
      AND is_active = 1
      AND time = DATE_FORMAT(NOW(), '%H:%i')
      AND (
        frequency = 'daily'
        OR (frequency = 'weekly' AND DAYOFWEEK(NOW()) = DAYOFWEEK(created_at))
        OR (frequency = 'monthly' AND DAY(NOW()) = DAY(created_at))
      )
  `);
    console.log("checking schedule generation3")
  const [oneTimeSchedules] = await db.execute(`
    SELECT * FROM scheduled_image_prompts
    WHERE is_recurring = 0
      AND is_active = 1
      AND DATE_FORMAT(run_at, '%Y-%m-%d %H:%i') = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i')
  `);
console.log("checking schedule generation4")
  const allSchedules = [...recurringSchedules, ...oneTimeSchedules];

  for (const schedule of allSchedules) {
    for (let i = 0; i < schedule.images_per_run; i++) {
      await generateImage({
        user_id: schedule.user_id,
        prompt: schedule.prompt,
        model: schedule.model,
        aspect_ratio: schedule.aspect_ratio,
        quality: schedule.quality,
        style: schedule.style,
        resolution: schedule.resolution,
        chat_id: null,
        use_context: false
      });
    }
console.log("checking schedule generation5")
    if (!schedule.is_recurring) {
      await db.execute(
        `UPDATE scheduled_image_prompts SET is_active = 0 WHERE schedule_id = ?`,
        [schedule.schedule_id]
      );
    }
  }
});
