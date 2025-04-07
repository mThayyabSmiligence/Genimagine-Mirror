import React, { useContext } from 'react'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import DropdownContext from '../../Context/DropdownProvider';

export default function AdminTopbar() {
  const { showDropdown, setShowDropdown, dropdownRef } = useContext(DropdownContext);
    return (
      <div className="moderator-profile-dropdown">
          <button className='profile-button dark-button me-3 ' onClick={() => setShowDropdown(!showDropdown)}>
              <PersonOutlineOutlinedIcon/>
          </button>         
      </div>
    )
}
