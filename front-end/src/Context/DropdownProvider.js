import React, { createContext, useState, useEffect, useRef } from 'react';

const DropdownContext = createContext();

export const DropdownProvider = ({ children }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showEditProfile,setShowEditProfile] = useState(false)
    // const [showOptions, setShowOptions] =useState(false)
    // const optionsRef = useRef(null); 
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                setShowEditProfile(false)
            }
        };

        if (showDropdown||showEditProfile) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown, showEditProfile ]);
    return (
        <DropdownContext.Provider value={{ showDropdown, setShowDropdown, dropdownRef, showEditProfile,setShowEditProfile}}>
            {children}
        </DropdownContext.Provider>
    );
};

export default DropdownContext;
