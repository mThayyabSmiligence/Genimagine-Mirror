const cron = require('node-cron');

cron.schedule('* * * * *', async() => {
  console.log("checking schedule generation2")
  const [recurringSchedules] = await db.execute(`
    SELECT * FROM scheduled_image_prompts
    WHERE is_recurring = 1
      AND is_active = 1
      AND is_deleted = 0
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
      AND is_deleted = 0
      AND DATE_FORMAT(run_at, '%Y-%m-%d %H:%i') = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i')
  `);

 console.log(
    `Recurring tasks due: ${recurringSchedules.length}, One-time tasks due: ${oneTimeSchedules.length}`
  );

  console.log("checking schedule generation4")
  const allSchedules = [...recurringSchedules, ...oneTimeSchedules];

  for (const schedule of allSchedules) {

    const model = JSON.parse(schedule.model);
    const aspect_ratio = JSON.parse(schedule.aspect_ratio);
    const quality = JSON.parse(schedule.quality);
    const style = JSON.parse(schedule.style);

    for (let i = 0; i < schedule.images_per_run; i++) {
      await generateImage({
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
  console.log("checking schedule generation5")
    if (!schedule.is_recurring) {
      await db.execute(
        `UPDATE scheduled_image_prompts SET is_active = 0 WHERE schedule_id = ?`,
        [schedule.schedule_id]
      );
    }
  }
});
