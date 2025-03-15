import React, { useEffect, useState } from 'react';
import '../../Css/MathCaptcha.css';

const MathCaptcha = ({ onVerify }) => {
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [operator, setOperator] = useState("+");
    const [userAnswer, setUserAnswer] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        generateCaptcha();
      }, []);
    
      const generateCaptcha = () => {
        const randomNum1 = Math.floor(Math.random() * 10) + 1;
        const randomNum2 = Math.floor(Math.random() * 10) + 1;
        const operators = ["+", "-", "*"];
        const randomOperator = operators[Math.floor(Math.random() * operators.length)];
    
        setNum1(randomNum1);
        setNum2(randomNum2);
        setOperator(randomOperator);
        setUserAnswer("");
        
      };
    
      const calculateAnswer = () => {
        switch (operator) {
          case "+":
            return num1 + num2;
          case "-":
            return num1 - num2;
          case "*":
            return num1 * num2;
          default:
            return 0;
        }
      };
    
      const handleSubmit = (e) => {
        e.preventDefault(); // Prevent the page from reloading

        
        if (userAnswer.length == 0) {
          setError("Please enter a captcha.");
          return;
        }
        const correctAnswer = calculateAnswer();
    
        if (parseInt(userAnswer) === correctAnswer) {
            onVerify(true);
            setError("");
            console.log("Correct answer");
        } else {
            onVerify(false);
            setError("Incorrect answer. Try again.");
            generateCaptcha();
        }
    };
    
    
    
    return(
        <div className='math-captcha-container'>
            
            
             <p>Solve this: {num1} {operator} {num2} = ?</p>
                <form className='d-flex flex-column align-items-center' >


                    <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    required
                    placeholder="Enter your answer"
                    />
                    <div className='button-wh light-button-wh' onClick={(e)=>handleSubmit(e)} type="submit" disabled={!userAnswer.trim()}>Verify</div>

                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    )
}

export default MathCaptcha;