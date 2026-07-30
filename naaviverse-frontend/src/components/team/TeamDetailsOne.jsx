import React, { Fragment } from 'react';

const founderData = [
    {
        name: "Dr. Rajesh Kumar",
        role: "Founder & CEO",
        bio: "Dr. Rajesh Kumar founded Naavi with a vision to transform career guidance using artificial intelligence. His mission is to empower students with intelligent, data-driven career pathways that enable confident and informed decisions.",
        expertise: "Artificial Intelligence, Product Strategy, Leadership"
    }
];

const teamMembers = [
    { name: "Rahul Verma", role: "Frontend Developer" },
    { name: "Sneha Iyer", role: "Backend Developer" },
    { name: "Arjun Patel", role: "AI Engineer" },
    { name: "Meera Nair", role: "UI/UX Designer" },
    { name: "Karan Gupta", role: "Cloud Engineer" },
    { name: "Priya Sharma", role: "Data Analyst" }
];

const TeamDetailsOne = () => {
    return (
        <Fragment>

            {/* Animation Style */}
            <style>
            {`
                @keyframes scrollMembers {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }
            `}
            </style>

            {/* ================= FOUNDERS SECTION ================= */}

            <section
                id="founders"
                style={{
                    padding: "120px 0",
                    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)"
                }}
            >

                <div className="container">

                    {founderData.map((founder, index) => (

                      <div
    key={index}
    data-aos="fade-up"
    data-aos-duration="1000"
    style={{
        maxWidth: "900px",
        margin: "0 auto",
        textAlign: "center",
        borderRadius: "22px",
        padding: "70px 60px",
        position: "relative",
        background: "linear-gradient(135deg, rgba(243,232,255,0.7), rgba(255,255,255,0.9))",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(124,58,237,0.15)",
        boxShadow: `
            0 10px 30px rgba(124,58,237,0.08),
            0 2px 10px rgba(0,0,0,0.04)
        `,
        transition: "all 0.4s ease",
        overflow: "hidden"
    }}
    onMouseEnter={(e)=>{
        e.currentTarget.style.transform="translateY(-6px)";
        e.currentTarget.style.boxShadow="0 20px 50px rgba(124,58,237,0.15)";
    }}
    onMouseLeave={(e)=>{
        e.currentTarget.style.transform="translateY(0px)";
        e.currentTarget.style.boxShadow="0 10px 30px rgba(124,58,237,0.08)";
    }}
>


                            <h2
                                style={{
                                    fontSize: "38px",
                                    letterSpacing: "-0.5px",
                                    fontWeight: "700",
                                    color: "#2a1458",
fontSize: "18px",

                                    marginBottom: "10px"
                                }}
                            >
                                {founder.name}
                            </h2>

                            <p
                                style={{
    fontSize: "18px",
    color: "#7c3aed",
    fontWeight: "600",
    marginBottom: "25px",
    letterSpacing: "0.5px"
}}

                            >
                                {founder.role}
                            </p>

                            <div
    style={{
        width: "70px",
        height: "4px",
        background: "linear-gradient(90deg, #7c3aed, #c4b5fd)",
        margin: "0 auto 30px auto",
        borderRadius: "4px"
    }}
/>


                            <p
                                style={{
    fontSize: "17px",
    lineHeight: "1.9",
    color: "#444",
    marginBottom: "35px",
    maxWidth: "650px",
    marginLeft: "auto",
    marginRight: "auto"
}}

                            >
                                {founder.bio}
                            </p>

                            <div>

                                <h6
                                    style={{
                                        fontWeight: "600",
                                       color: "#2a1458",
fontSize: "18px",

                                        marginBottom: "10px"
                                    }}
                                >
                                    Expertise
                                </h6>

                                <p
                                    style={{
    color: "#666",
    fontSize: "16px",
    fontWeight: "500"
}}

                                >
                                    {founder.expertise}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </section>


            {/* ================= TEAM MEMBERS SECTION ================= */}

            <section
                id="team-members"
                style={{
                    padding: "100px 0",
                    background: "#f8fbff",
                    overflow: "hidden"
                }}
            >

                <div className="container">

                    <div style={{ textAlign: "center", marginBottom: "50px" }}>

                        <h2
                            style={{
                                fontWeight: "700",
                                color: "#2a1458",
fontSize: "18px",

                            }}
                        >
                            Our Team Members
                        </h2>

                        <p style={{ color: "#666" }}>
                            Meet the talented professionals driving innovation and excellence.
                        </p>

                    </div>

                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "30px",
                        animation: "scrollMembers 25s linear infinite",
                        width: "max-content",
                        paddingLeft: "30px"
                    }}
                >

                    {[...teamMembers, ...teamMembers].map((member, index) => (

                        <div
                            key={index}
                            style={{
                                minWidth: "260px",
                                background: "#ffffff",
                                padding: "25px",
                                borderRadius: "14px",
                                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                                textAlign: "center"
                            }}
                        >

                            <h5 style={{ color: "#2273E6" }}>
                                {member.name}
                            </h5>

                            <p style={{ color: "#666" }}>
                                {member.role}
                            </p>

                        </div>

                    ))}

                </div>

            </section>

        </Fragment>
    );
};

export default TeamDetailsOne; 
