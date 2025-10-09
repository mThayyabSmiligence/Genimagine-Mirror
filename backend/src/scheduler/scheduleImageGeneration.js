const cron = require('node-cron');
const db = require('../config/connectDatabase');
const { generateImageForScheduledGeneration } = require('../service/generateImageForScheduledGeneration');

// cron.schedule('* * * * *', async() => {
//   console.log("checking schedule generation2")
//   const [recurringSchedules] = await db.execute(`
//     SELECT * FROM scheduled_image_prompts
//     WHERE is_recurring = 1
//       AND is_active = 1
//       AND is_deleted = 0
//       AND time = DATE_FORMAT(NOW(), '%H:%i')
//       AND (
//         frequency = 'daily'
//         OR (frequency = 'weekly' AND DAYOFWEEK(NOW()) = DAYOFWEEK(created_at))
//         OR (frequency = 'monthly' AND DAY(NOW()) = DAY(created_at))
//       ) 
//   `);
//     //   try {
//     //   const [recurringSchedules] = await db.execute(`
//     //     SELECT * FROM scheduled_image_prompts
//     //     WHERE is_recurring = 1
//     //       AND is_active = 1
//     //       AND is_deleted = 0
//     //       AND \`time\` = DATE_FORMAT(NOW(), '%H:%i')
//     //       AND (
//     //         frequency = 'daily'
//     //         OR (frequency = 'weekly' AND DAYOFWEEK(NOW()) = DAYOFWEEK(created_at))
//     //         OR (frequency = 'monthly' AND DAY(NOW()) = DAY(created_at))
//     //       )
//     //   `);
//     //   console.log("checking schedule generation3");
//     // } catch (err) {
//     //   console.error("Error fetching recurringSchedules:", err);
//     //   return; // so cron can exit gracefully
//     // }

//     console.log("checking schedule generation3")
//   const [oneTimeSchedules] = await db.execute(`
//     SELECT * FROM scheduled_image_prompts
//     WHERE is_recurring = 0
//       AND is_active = 1
//       AND is_deleted = 0
//       AND run_at <= NOW()
//       AND run_at > NOW() - INTERVAL 1 MINUTE
//       -- AND DATE_FORMAT(run_at, '%Y-%m-%d %H:%i') = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i')
//   `);

//  console.log(
//     `Recurring tasks due: ${recurringSchedules.length}, One-time tasks due: ${oneTimeSchedules.length}`
//   );

//   console.log("checking schedule generation4")
//   const allSchedules = [...recurringSchedules, ...oneTimeSchedules];

//   for (const schedule of allSchedules) {

//     const model = schedule.model;
//     const aspect_ratio = schedule.aspect_ratio;
//     const quality = schedule.quality;
//     const style = schedule.style;

//     for (let i = 0; i < schedule.images_per_run; i++) {
//       await generateImageForScheduledGeneration({
//         user_id: schedule.user_id,
//         prompt: schedule.prompt,
//         model: model.id,
//         aspect_ratio: aspect_ratio.id,
//         quality: quality.id,
//         style: style.id,
//         chat_id: null,
//         use_context: false
//       });
//     }
//   console.log("checking schedule generation5")
//     if (!schedule.is_recurring) {
//       await db.execute(
//         `UPDATE scheduled_image_prompts SET is_active = 0 WHERE schedule_id = ?`,
//         [schedule.schedule_id]
//       );
//     }
//   }
// });


function safeParse(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (err) {
      console.error("Failed to parse JSON:", value, err);
      return null;
    }
  }
  return value;
}

cron.schedule('* * * * *', async () => {

  // const [recurringSchedules] = await db.execute(`
  //   SELECT * FROM scheduled_image_prompts
  //   WHERE is_recurring = 1
  //     AND is_active = 1
  //     AND is_deleted = 0
  //     AND time = DATE_FORMAT(NOW(), '%H:%i')
  //     AND (
  //       frequency = 'daily'
  //       OR (frequency = 'weekly' AND DAYOFWEEK(NOW()) = DAYOFWEEK(created_at))
  //       OR (frequency = 'monthly' AND DAY(NOW()) = DAY(created_at))
  //     )
  // `);




  const [recurringSchedules] = await db.execute(`
    SELECT * 
    FROM scheduled_image_prompts
    WHERE is_recurring = 1
      AND is_active = 1
      AND is_deleted = 0
      -- Allow 60-second window around the scheduled time
      -- AND TIME(time) BETWEEN DATE_SUB(TIME(NOW()), INTERVAL 30 SECOND)                    -- working with interval one minute
      --                  AND DATE_ADD(TIME(NOW()), INTERVAL 30 SECOND)
       -- Time window for tolerance (±1 min)
      AND TIME(time) BETWEEN DATE_SUB(TIME(NOW()), INTERVAL 1 MINUTE)                          
                        AND DATE_ADD(TIME(NOW()), INTERVAL 1 MINUTE)
      -- Prevent multiple runs in same day
      AND (last_run_at IS NULL OR DATE(last_run_at) < CURDATE())
      AND (
        frequency = 'daily'
        OR (frequency = 'weekly' AND DAYOFWEEK(NOW()) = DAYOFWEEK(created_at))
        OR (frequency = 'monthly' AND DAY(NOW()) = DAY(created_at))
      )
  `);



  const [oneTimeSchedules] = await db.execute(`
    SELECT * FROM scheduled_image_prompts
    WHERE is_recurring = 0
      AND is_active = 1
      AND is_deleted = 0
      AND run_at <= NOW()
      AND run_at > NOW() - INTERVAL 2 MINUTE
  `);



  const allSchedules = [...recurringSchedules, ...oneTimeSchedules];

  for (const schedule of allSchedules) {
    // Deactivate any missed/expired one-time schedules
    await db.execute(`
      UPDATE scheduled_image_prompts
      SET is_active = 0
      WHERE is_recurring = 0
        AND is_active = 1
        AND is_deleted = 0
        AND run_at < NOW()
    `);

    const model = safeParse(schedule.model);
    const aspect_ratio = safeParse(schedule.aspect_ratio);
    const quality = safeParse(schedule.quality);
    const style = safeParse(schedule.style);

    if (!model || !aspect_ratio || !quality || !style) {
      console.error(`Skipping schedule ${schedule.schedule_id} due to bad JSON`);
      continue;
    }

    for (let i = 0; i < schedule.images_per_run; i++) {
      await generateImageForScheduledGeneration({
        schedule_id: schedule.schedule_id,
        user_id: schedule.user_id,
        prompt: schedule.prompt,
        model: model.id,
        aspect_ratio: aspect_ratio.id,
        quality: quality.id,
        style: style.id,
        chat_id: null,
        use_context: false
      });
    }



    // if (!schedule.is_recurring) {
    //   await db.execute(
    //     `UPDATE scheduled_image_prompts SET is_active = 0, status = 'completed' WHERE schedule_id = ?`,
    //     [schedule.schedule_id]
    //   );
    // }
    if (schedule.is_recurring) {
      await db.execute(
        `UPDATE scheduled_image_prompts 
        SET status = 'pending', last_run_at = NOW() 
        WHERE schedule_id = ?`,
        [schedule.schedule_id]
      );
    } else {
      await db.execute(
        `UPDATE scheduled_image_prompts 
        SET is_active = 0, status = 'completed', last_run_at = NOW() 
        WHERE schedule_id = ?`,
        [schedule.schedule_id]
      );
    }
  }
});
