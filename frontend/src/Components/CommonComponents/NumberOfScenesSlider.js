import React from 'react';
import { Box, Typography, Slider } from '@mui/material';
import '../../Css/NumberOfScenesSlider.css';

const NumberOfScenesSlider = ({ 
  value = 3, 
  onChange, 
  min = 1, 
  max = 10, 
  disabled = false,
  className = ""
}) => {
  const handleSliderChange = (event, newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className={`scenes-slider-component ${className}`}>
      <Box className="scenes-slider-container">
        <Box className="scenes-slider-wrapper">
          <Typography variant="body2" className="scenes-min">
            {min}
          </Typography>
          <Slider
            value={value}
            onChange={handleSliderChange}
            aria-labelledby="scenes-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={min}
            max={max}
            disabled={disabled}
            className="scenes-slider"
            sx={{
              color: '#667eea',
              flex: 1,
              marginX: 2,
              '& .MuiSlider-thumb': {
                backgroundColor: '#667eea',
                border: '2px solid #fff',
                width: 24,
                height: 24,
                '&:hover': {
                  boxShadow: '0px 0px 0px 8px rgba(102, 126, 234, 0.16)',
                },
                '&.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px rgba(102, 126, 234, 0.16)',
                },
              },
              '& .MuiSlider-track': {
                backgroundColor: '#667eea',
                height: 6,
                border: 'none',
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#e2e8f0',
                height: 6,
              },
              '& .MuiSlider-mark': {
                backgroundColor: '#cbd5e0',
                height: 10,
                width: 2,
                '&.MuiSlider-markActive': {
                  backgroundColor: '#667eea',
                },
              },
              '& .MuiSlider-valueLabel': {
                backgroundColor: '#667eea',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                '&:before': {
                  color: '#667eea',
                },
              },
              '&.Mui-disabled': {
                color: '#cbd5e0',
                '& .MuiSlider-thumb': {
                  backgroundColor: '#cbd5e0',
                },
                '& .MuiSlider-track': {
                  backgroundColor: '#cbd5e0',
                },
                '& .MuiSlider-mark': {
                  backgroundColor: '#e2e8f0',
                },
              },
            }}
          />
          <Typography variant="body2" className="scenes-max">
            {max}
          </Typography>
        </Box>
        <div className="scenes-value-display">
          <span className="scenes-count">{value}</span>
          <span className="scenes-label">scene{value !== 1 ? 's' : ''}</span>
        </div>
      </Box>
    </div>
  );
};

export default NumberOfScenesSlider;
