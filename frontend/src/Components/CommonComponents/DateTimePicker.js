import React, { useState } from 'react';
import dayjs from 'dayjs'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';

export default function DateTimePickerValue({value, setValue}) {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateTimePicker
        label="Select Date & Time"
        value={value}
        onChange={(newValue) => {setValue(newValue)
        }}
        renderInput={(params) => <TextField {...params} fullWidth />}
        inputFormat="DD/MM/YYYY HH:mm"
      />
    </LocalizationProvider>
  );
}
