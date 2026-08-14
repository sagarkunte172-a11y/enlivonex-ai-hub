import "./Contact.css";
import { useState } from "react";

/*
=====================================================
API CONFIG
=====================================================

The frontend may be opened from:

http://localhost:3000
or
http://192.168.x.x:3000

Using window.location.hostname makes the API work
for both the host PC and other devices on the same LAN.
*/

const API_URL = `http://${window.location.hostname}:5000/api/contact`;

function Contact() {

    const [formData, setFormData] = useState({

        name: "",
        email: "",
        subject: "",
        message: ""

    });

    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState("");

    /*
    ================================================
    HANDLE INPUT CHANGE
    ================================================
    */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({

            ...prev,

            [name]: value

        }));

    };

    /*
    ================================================
    HANDLE SUBMIT
    ================================================
    */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        setLoading(true);

        setStatus("");

        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(formData)

            });

            let data = {};

            try {

                data = await response.json();

            } catch {

                data = {};

            }

            if (!response.ok) {

                throw new Error(

                    data.message ||

                    `Server returned ${response.status}`

                );

            }

            setStatus("✅ Message sent successfully!");

            setFormData({

                name: "",
                email: "",
                subject: "",
                message: ""

            });

        }

        catch (error) {

            console.error("Contact Error:", error);

            setStatus(

                `❌ ${

                    error.message ||

                    "Unable to send message."

                }`

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <section className="contact-page">

            <h1>📩 Contact Enlivonex</h1>

            <p>

                We'd love to hear your ideas, feedback,

                bug reports or collaboration proposals.

            </p>

            <div className="contact-container">

                {/* =================================
                    CONTACT INFORMATION
                ================================= */}

                <div className="contact-info">

                    <div className="info-card">

                        <h3>📧 Official Email</h3>

                        <p>

                            enlivonexofficial@gmail.com

                        </p>

                    </div>

                    <div className="info-card">

                        <h3>🐙 GitHub</h3>

                        <p>

                            https://github.com/Enlivonex

                        </p>

                    </div>

                    <div className="info-card">

                        <h3>💬 Discord</h3>

                        <p>

                            Coming Soon

                        </p>

                    </div>

                    <div className="info-card">

                        <h3>💼 LinkedIn</h3>

                        <p>

                            Coming Soon

                        </p>

                    </div>

                </div>

                {/* =================================
                    CONTACT FORM
                ================================= */}

                <form

                    className="contact-form"

                    onSubmit={handleSubmit}

                >

                    <input

                        type="text"

                        name="name"

                        placeholder="Your Name"

                        value={formData.name}

                        onChange={handleChange}

                        required

                        disabled={loading}

                    />

                    <input

                        type="email"

                        name="email"

                        placeholder="Your Email"

                        value={formData.email}

                        onChange={handleChange}

                        required

                        disabled={loading}

                    />

                    <input

                        type="text"

                        name="subject"

                        placeholder="Subject"

                        value={formData.subject}

                        onChange={handleChange}

                        required

                        disabled={loading}

                    />

                    <textarea

                        rows="6"

                        name="message"

                        placeholder="Your Message"

                        value={formData.message}

                        onChange={handleChange}

                        required

                        disabled={loading}

                    />

                    <button

                        type="submit"

                        disabled={loading}

                    >

                        {

                            loading

                                ? "Sending..."

                                : "Send Message"

                        }

                    </button>

                    {

                        status && (

                            <p className="status-message">

                                {status}

                            </p>

                        )

                    }

                </form>

            </div>

        </section>

    );

}

export default Contact;