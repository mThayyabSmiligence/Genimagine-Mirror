import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {useInView} from 'react-intersection-observer'


const sortOptions = [
        { value: 'recent', label: 'Recent' },
        { value: 'top', label: 'Top' },
    ]


    const TopOptions = [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' },
        { value: 'all', label: 'All'}
    ]
function SortSection({setSort,sort,top,setTop,setSortSelectedIndex,setTopSelectedIndex,oldest}) {
 

    useEffect(()=>{
        setSort(sortOptions[0].value);
        setTop(TopOptions[0].value);
        if(sortOptions.length <3){
        if(oldest)sortOptions.push({value: "oldest",label: "Oldest"});
        }
    },[])

    const handleSortChange = (event) => {
        setSort(event.target.value);
        setSortSelectedIndex(sortOptions.findIndex((option)=>option.value===event.target.value))    ;
    };
    const handleTopChange = (event) => {
        setTop(event.target.value);
        setTopSelectedIndex(TopOptions.findIndex((option)=>option.value===event.target.value))    ;
    };
    
  return (
    <div className='sort-section d-flex justify-content-start ms-3'>
        <div className='mx-1'>
        <Box sx={{ minWidth: 120, width:"150px"}} >
            <FormControl fullWidth size='small'>
                <InputLabel id="demo-simple-select-label">Sort</InputLabel>
                <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={sort}
                label="Sort"
                onChange={(e)=>handleSortChange(e)}
                >
                    {
                        sortOptions.map((options,index) => (
                            <MenuItem key={index} value={options.value}>{options.label}</MenuItem>
                        ))
                    }
                </Select> 
            </FormControl>
        </Box>
        </div>{
        sort==='top' &&
        <div className='mx-2'>
        <Box sx={{ minWidth: 120, width:"150px"}} >
            <FormControl fullWidth size='small'>
                <InputLabel id="demo-simple-select-label">Top</InputLabel>
                <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={top}
                label="Sort"
                onChange={handleTopChange}
                >{
                    TopOptions.map((options,index) => (
                        <MenuItem key={index} value={options.value}>{options.label}</MenuItem>
                    ))
                }
                </Select>
            </FormControl>
        </Box>
        </div>
        }
    </div>
  )
}

export default SortSection