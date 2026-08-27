import React, { useState } from 'react';

const NewsLetterForm = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            // You can handle the actual form submission here
            setMessage('Your email was successfully submitted!');
            setEmail(''); // Clear the input field after submission
        } else {
            setMessage('Please enter a valid email.');
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button className="ripple-btn tran3s" type="submit">Subscribe</button>
            </form>
            {message && <p className="message-text">{message}</p>}
        </>
    );
};

export default NewsLetterForm;
