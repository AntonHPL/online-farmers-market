import { useState, useContext, FC, FormEvent } from "react";
import { TextField, IconButton, Paper, Typography } from "@mui/material";
import { AccountCircle, Send } from "@mui/icons-material";
import { useEffect } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";
import { MessageType, InterlocutorType, ChatType, DataChatType } from "../types";

const Profile: FC = () => {
    const [oldMessages, setOldMessages] = useState<Array<MessageType>>([]);
    const [newMessages, setNewMessages] = useState<Array<MessageType>>([]);
    const [allMessages, setAllMessages] = useState<Array<MessageType>>([]);
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
    // const [senderName, setSenderName] = useState("Anton");
    const [message, setMessage] = useState("");
    const [chatCreationDate, setChatCreationDate] = useState<string>("");
    const [userId, setUserId] = useState("");
    const [chats, setChats] = useState<Array<ChatType>>([]);
    const [interlocutors, setInterlocutors] = useState<Array<string>>([]);
    const [myId, setMyId] = useState("");

    const { user } = useContext(UserContext);
    // console.log(oldMessages, newMessages, allMessages, chats, interlocutors);
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:3002");
        ws.onopen = () => {
            console.log("Connected to the WS Server.");
        };
        ws.onmessage = message => {
            // console.log("Message from server: ", e.data)
            setNewMessages(prev => Array.isArray(JSON.parse(message.data)) ? [...prev, ...JSON.parse(message.data)] : [...prev, JSON.parse(message.data)]);
            // console.log("new message", JSON.parse(message.data));
        };
        setWebSocket(ws);
    }, []);

    useEffect(() => {
        user && setMyId(user.id)
    }, [user]);

    useEffect(() => {
        myId &&
            axios
                .get(`/api/chats/${myId}`)
                .then(({ data }) => {
                    if (data.length) {
                        console.log(data)
                        setInterlocutors(data.map((el: DataChatType): InterlocutorType => el.participants.find(participant => participant !== myId) || null));
                        setChats(data.map((el: DataChatType): ChatType => {
                            return {
                                interlocutor: el.participants.find(participant => participant !== myId) || null,
                                messages: el.messages,
                                creationDate: el.creationDate,
                            }
                        }));
                    } else {
                        setOldMessages([])
                    }
                })
                .catch(() => console.log("did not work"));
    }, [myId])

    const send = (e: FormEvent): void => {
        e.preventDefault();
        webSocket && webSocket.send(JSON.stringify({ senderId: myId, message }));
        setMessage("");
        // ws.send("Hello from Client1")
    };

    const save = () => {
        oldMessages.length ?
            axios.put("/api/chat", {
                messages: newMessages, creationDate: chatCreationDate
            })
            :
            axios.post("/api/chat", {
                participants: ["62c5e3e6d40732eacff00384", userId],
                messages: newMessages,
                creationDate: new Date().toISOString()
            });
    };

    useEffect(() => {
        if (oldMessages.length) {
            const arr = oldMessages.concat(newMessages);
            let date = new Date(arr[0].creationDate || "").toLocaleDateString();
            for (let i = 0; i < arr.length; i++) {
                const currentDate = new Date(arr[i].creationDate || "");
                if (currentDate && currentDate.toLocaleDateString() !== date) {
                    arr[i] = {
                        ...arr[i], break: currentDate.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                        })
                    };
                };
            };
            setAllMessages(arr);
        };
    }, [newMessages, oldMessages])

    const revealHistory = (el: string): void => {
        setNewMessages([]);
        setOldMessages(chats.find(chat => chat.interlocutor === el)?.messages || []);
        setChatCreationDate(chats.find(chat => chat.interlocutor === el)?.creationDate || "")
    };

    const getLastMessage = (el: string): MessageType | void => {
        if (chats.length) {
            const relatedChat = chats.find(chat => chat.interlocutor === el);
            if (relatedChat) {
                const relatedMessages = relatedChat.messages;
                const lastMessage = relatedMessages[relatedMessages.length - 1];
                return lastMessage;
            };
        };
    };
    return (
        <div className="chat_container">
            <div className="interlocutors">
                {interlocutors?.length && interlocutors.map(el => el === "62cf1c8dfd4a4e5bea73f3f3" ? (
                    <Paper className="interlocutor" onClick={() => revealHistory(el)}>
                        <AccountCircle className="interlocutor_image" />
                        <div>
                            <Typography variant="h6" className="interlocutor_name">
                                Semen
                            </Typography>
                            {getLastMessage(el)?.senderId === myId ? `You: ${getLastMessage(el)?.message}` : getLastMessage(el)?.message}
                        </div>
                    </Paper>) :
                    <Paper className="interlocutor" onClick={() => revealHistory(el)}>
                        <AccountCircle className="interlocutor_image" />
                        <div>
                            <Typography variant="h6" className="interlocutor_name">
                                Claire
                            </Typography>
                            {getLastMessage(el)?.senderId === myId ? `You: ${getLastMessage(el)?.message}` : getLastMessage(el)?.message}
                        </div>
                    </Paper>
                )}
            </div>
            <div className="chat_and_form">
                <div className="chat">
                    {allMessages.map(el => {
                        return (
                            <>
                                <div>{el.break && el.break}</div>
                                <Paper
                                    className={el.senderId === myId ? "sent_message" : "received_message"}
                                >
                                    {el.message}
                                    <div>
                                        {el.creationDate && new Date(el.creationDate)
                                            .toLocaleTimeString("en-US", {
                                                hour: "numeric",
                                                minute: "numeric"
                                            })
                                        }
                                    </div>
                                </Paper>
                            </>
                        )
                    })}
                </div>
                <form onSubmit={send} className="messageForm">
                    <TextField
                        required
                        type="text"
                        size="small"
                        variant="outlined"
                        value={message}
                        autoComplete="off"
                        placeholder="Enter your Message"
                        onChange={e => setMessage(e.target.value)}
                        className="form_row"
                    />
                    <IconButton type="submit">
                        <Send />
                    </IconButton>
                </form>
            </div>

            <button onClick={save}></button>
        </div >
    );
};

export default Profile;