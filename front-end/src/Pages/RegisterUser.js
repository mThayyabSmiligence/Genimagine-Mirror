import React from 'react'

export default function RegisterUser() {
  return (
    <div>

        <div>
            <h1>Register User</h1>
            <form>
                <label>
                    Username:
                    <input type="text" name="username" />
                </label>
                <br />
                <label>
                    Password:
                    <input type="password" name="password" />
                </label>
                <br />
                <input type="submit" value="Register" />
            </form>
    
        </div>
    </div>
  )
}
