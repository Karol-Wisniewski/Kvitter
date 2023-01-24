import axios from "axios";
import avatar from "../Utils/avatar.png";
import { CurrentUserContext } from "../App";
import "../Style/Chat/ChatStyle.scss";
import { Formik, Form, Field, connect } from 'formik';
import { useEffect, useState, useContext, useLayoutEffect, useRef } from "react";
import moment from "moment";
import * as uuid from 'uuid';
import mqtt from "precompiled-mqtt"

const Chat = ({sender, receiver, setOpenChatUser}) => {

    const {currentUser} = useContext(CurrentUserContext);

    const [messages, setMessages] = useState();

    const addMessage = (message) => {
        setMessages((oldMessages) => [...oldMessages, message])
    }

    const scrollRef = useRef();

    const getMessages = async (senderId, receiverId) => {
        return axios.get(`http://localhost:3000/chat/${senderId}/${receiverId}`)
        .then(res => {
            console.log("ALL MESSAGES FOR THIS CHAT:")
            console.log(res.data)
            return res.data;
        })
        .catch(err => console.log(err))
    };
    useEffect(() => {

        const mqttClient  = mqtt.connect('mqtt://localhost:8000/mqtt')
        mqttClient.on("connect", () => {
            console.log("connected")
        })
        mqttClient.subscribe(`chat/${sender.id}/${receiver.id}`)
        mqttClient.subscribe(`chat/${receiver.id}/${sender.id}`)
        mqttClient.on("message", (topic, rawMessage) => {
            const message = JSON.parse(rawMessage.toString())
            console.log(topic, message)
            addMessage(message)
            // przychodzace
            // if (topic == `chat/${receiver.id}/${sender.id}`) {
                
            // }
            // // wychodzace
            // else if (topic == `chat/${sender.id}/${receiver.id}`) {
            //     // console.log("wychodzace", message)
            // }
        })
        return () => {
            mqttClient.end()

        }
        
    }, [])
    useLayoutEffect(() => {
        const element = scrollRef.current;
        const { scrollHeight } = element;
        element.scrollTop = scrollHeight;
    }, [messages]);

    useEffect(() => {
        getMessages(sender.id, receiver.id).then(data => {
            setMessages(data)
        });
    }, [sender, receiver]);

    return (
        <div className="Chat">
            <div className="chat-nav-div">
                <div>
                    {
                        receiver.profilePictureUrl ?
                        <img 
                            alt="avatar"
                            crossOrigin="anonymous"
                            src={`http://localhost:3000/images/${receiver.profilePictureUrl}`}
                            className="avatar"
                        >
                        </img>
                        :
                        <img
                            alt="avatar"
                            src={avatar}
                            className="avatar"
                        >
                        </img>
                    }
                    <p>{receiver.firstName} {receiver.lastName}</p>
                </div>
                <button onClick={() => setOpenChatUser({})} className="close-chat-btn">&#10005;</button>
            </div>
            <div className="chat-content-div" ref={scrollRef}>
                {!!messages?.length && 
                    Array.from(messages)
                    .sort((m1, m2) => {
                    return new Date(m1.date) - new Date(m2.date)
                    })
                    .map(msg => {
                        return msg.senderId === currentUser.id ?
                        <div className="sender-message" key={uuid.v4()}>
                            <p>{moment(msg.date).fromNow()}</p>
                            <p>{msg.content}</p>
                        </div>
                        :
                        <div className="receiver-message" key={uuid.v4()}>
                            <p>{moment(msg.date).fromNow()}</p>
                            <p>{msg.content}</p>
                        </div>
                    })
                }
            </div>
            <div className="chat-controls-div">
                <Formik
                    initialValues={{
                        content: '',
                        date: ''
                    }}
                    validate={values => {}}
                    onSubmit={(values, { resetForm }) => {

                        const currentDate = new Date().toJSON();

                        axios.post(
                            `http://localhost:3000/chat/${sender.id}/${receiver.id}`,
                            {
                                senderId: sender.id,
                                receiverId: receiver.id,
                                content: values.content,
                                date: currentDate
                            },
                            {
                                withCredentials: true
                            }
                        ).then(
                            (res) => { 
                                console.log(res)
                                
                                // getMessages(sender.id, receiver.id).then(data => setMessages(data))
                                resetForm();
                            }
                        ).catch(err => {
                            console.log(err);
                        })
                    }}
                >
                    <Form className="Form-msg">
                        <Field
                            className="message-input" 
                            name="content"
                            type="text"
                            placeholder="Send message..."
                            autoComplete="off"
                            required
                        />
                        <button 
                            className="submit-message" 
                            type="submit" 
                        >
                            &#8250;
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
};

export default Chat;