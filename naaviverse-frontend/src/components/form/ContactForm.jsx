import React, { Fragment, useState } from 'react';

const ContactForm = () => {
    // New API endpoint URL for NoCodeAPI Google Sheets integration
    const sheetAPIURL = 'https://v1.nocodeapi.com/anuradha1024/google_sheets/hsjQKzADGrGfmBmC?tabId=Sheet1';

    // State to manage success or error message
    const [statusMessage, setStatusMessage] = useState('');

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Retrieve form data
        const formData = [
            [e.target.elements.name.value.trim(), e.target.elements.email.value.trim(), e.target.elements.message.value.trim()]
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
                                placeholder="Your Name"
                                className="form-control"
                                required
                            />
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
