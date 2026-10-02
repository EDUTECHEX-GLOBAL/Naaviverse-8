import React, { Fragment, useState } from 'react';
import { validatePersonName } from '../../utils/emailValidator';

const ContactForm = () => {
    // New API endpoint URL for NoCodeAPI Google Sheets integration
    const sheetAPIURL = 'https://v1.nocodeapi.com/anuradha1024/google_sheets/hsjQKzADGrGfmBmC?tabId=Sheet1';

    // State to manage success or error message
    const [statusMessage, setStatusMessage] = useState('');
    const [nameVal, setNameVal] = useState('');
    const [nameError, setNameError] = useState('');

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const rawName = e.target.elements.name.value;
        const validation = validatePersonName(rawName, "Name");
        if (!validation.isValid) {
            setNameError(validation.message);
            setStatusMessage(validation.message);
            return;
        }
        setNameError('');

        // Retrieve form data
        const formData = [
            [validation.cleanName, e.target.elements.email.value.trim(), e.target.elements.message.value.trim()]
        ];

        // Headers setup for the request
        var myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');

        // Request options for the fetch call
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: JSON.stringify(formData) // Send form data as an array
        };

        // Send form data to Google Sheets via NoCodeAPI
        fetch(sheetAPIURL, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text(); // Parsing as text to see the response from the API
            })
            .then(result => {
                console.log('Success:', result); // Log the result from the fetch
                setStatusMessage('Form submitted successfully!'); // Set success message
                setNameVal('');
                setNameError('');
                e.target.reset(); // Reset the form after submission
            })
            .catch(error => {
                console.error('Error:', error); // Log any errors during submission
                setStatusMessage('Error submitting the form: ' + error.message); // Set error message
            });
    };

    return (
        <Fragment>
            <form id="contact-form" onSubmit={handleSubmit}>
                <div className="row">
                    {/* Name Field */}
                    <div className="col-12">
                        <div className="input-group-meta form-group mb-30">
                            <label>Name*</label>
                            <input
                                type="text"
                                name="name"
                                value={nameVal}
                                onChange={(e) => {
                                    setNameVal(e.target.value);
                                    if (nameError) {
                                        const res = validatePersonName(e.target.value, "Name");
                                        setNameError(res.isValid ? '' : res.message);
                                    }
                                }}
                                onBlur={() => {
                                    const res = validatePersonName(nameVal, "Name");
                                    setNameError(res.isValid ? '' : res.message);
                                }}
                                placeholder="Your Name"
                                className={`form-control ${nameError ? 'is-invalid' : ''}`}
                                required
                            />
                            {nameError && (
                                <div className="text-danger mt-1" style={{ fontSize: '13px' }}>
                                    {nameError}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="col-12">
                        <div className="input-group-meta form-group mb-30">
                            <label>Email*</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Your Email"
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    {/* Message Field */}
                    <div className="col-12">
                        <div className="input-group-meta form-group mb-30">
                            <label>Message*</label>
                            <textarea
                                name="message"
                                placeholder="Your Message"
                                className="form-control"
                                rows="5" // You can adjust the rows as needed
                                required
                            ></textarea>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="col-12">
                        <button type="submit" className="btn-eight ripple-btn">
                            Submit
                        </button>
                    </div>

                    {/* Status Message */}
                    <div className="col-12">
                        {statusMessage && (
                            <p className={statusMessage.includes('successfully') ? 'text-success' : 'text-danger'}>
                                {statusMessage}
                            </p>
                        )}
                    </div>
                </div>
            </form>
        </Fragment>
    );
};

export default ContactForm;
