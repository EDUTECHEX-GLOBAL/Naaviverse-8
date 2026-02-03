import React, {Fragment} from 'react';
import {Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel} from 'react-accessible-accordion';

const FaqContent = [
    {
        title: 'What are educational pathways?',
        desc: `Educational pathways are structured routes that guide students through various learning experiences, helping them achieve specific academic or career goals. `,
        expand: 'a'
    }, {
        title: 'How should we interact or provide information?',
        desc: `We should interact by delivering clear, concise, and relevant information that aligns with the needs and interests of the audience. Engaging communication fosters understanding and encourages meaningful dialogue.`,
        expand: 'b'
    }, {
        title: 'How does the personalisation works?',
        desc: `Personalization works by analyzing individual preferences, behaviors, and data to tailor content or experiences to each user. It ensures relevance by adapting to unique needs, creating a more engaging and customized interaction.`,
        expand: 'c'
    },
]

const Faq = () => {
    return (
        <Fragment>
            <Accordion
                className="accordion-style-one"
                preExpanded={["d"]}
                allowZeroExpanded>
                {FaqContent.map((item, i) => (
                    <AccordionItem className="accordion-item" key={i} uuid={item.expand}>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                <button className="accordion-button" type="button">
                                    {item.title}
                                </button>
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel className="accordion-body fadeInUp">
                            <p>
                                {item.desc}
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </Fragment>
    )
}

export default Faq