import { useState, useContext, FC, FormEvent } from "react";
import { Backdrop, TextField, IconButton, Paper, Typography, CircularProgress } from "@mui/material";
import { AccountCircle, Delete, NoPhotography, Send } from "@mui/icons-material";
import { useEffect } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";
import { MessageInterface, ChatInterface, BriefAdInterface, ModifiedChatInterface, SellerInterface } from "../types";

const Chats: FC = () => {
	const [oldMessages, setOldMessages] = useState<Array<MessageInterface>>([]);
	const [newMessages, setNewMessages] = useState<Array<MessageInterface>>([]);
	const [allMessages, setAllMessages] = useState<Array<MessageInterface>>([]);
	const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
	const [message, setMessage] = useState("");
	const [chatId, setChatId] = useState<string>("");
	const [chatsData, setChatsData] = useState<Array<ChatInterface>>([]);
	const [chats, setChats] = useState<Array<ModifiedChatInterface>>([]);
	const [myId, setMyId] = useState("");
	const [loading, setLoading] = useState(false);
	const [isChatChosen, setIsChatChosen] = useState(false);
	const { user } = useContext(UserContext);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:3002");
		ws.onopen = () => console.log("Connected to the WS Server.");
		ws.onmessage = message => setNewMessages(prev => [...prev, JSON.parse(message.data)]);
		setWebSocket(ws);
	}, []);

	useEffect(() => {
		user && setMyId(user._id)
	}, [user]);

	useEffect(() => {
		setLoading(true);
		myId &&
			axios
				.get(`/api/chats/${myId}`)
				.then(({ data }) => {
					if (data.length) {
						setChatsData(data);
						setLoading(false);
					} else {
						setOldMessages([]);
						setLoading(false);
					}
				})
	}, [myId]);

	useEffect(() => {
		if (chatsData.length) {
			const modifiedChatsData: Array<ModifiedChatInterface> = chatsData.map(chatData => {
				return {
					_id: chatData._id,
					myInterlocutor: chatData.participants.find(participant => participant?.id !== myId) || null,
					messages: chatData.messages,
					creationDate: chatData.creationDate,
					adId: chatData.adId,
				}
			});
			axios
				.get("/api/ads-briefly", {
					params: { adsIds: JSON.stringify(chatsData.map(el => el.adId)) }
				})
				.then(({ data }) => {
					modifiedChatsData.map((chat, i) => {
						data.map((ad: BriefAdInterface): void => {
							if (chat.adId === ad._id) {
								modifiedChatsData[i] = {
									...chat,
									adImage: ad.images[0]?.data || undefined,
									adTitle: ad.textInfo.title
								};
							};
						});
					});
					return axios.get("/api/sellers", {
						params: {
							sellersIds: JSON.stringify(
								chatsData.map(chatData =>
									chatData.participants.find(participant =>
										participant?.id !== myId)?.id
								))
						}
					})
				})
				.then(({ data }) => {
					modifiedChatsData.map((chat, i) => {
						data.map((seller: SellerInterface) => {
							if (chat.myInterlocutor?.id === seller._id) {
								modifiedChatsData[i] = {
									...chat,
									sellerImage: seller.image?.data || undefined,
								};
							};
						});
					});
					setChats(modifiedChatsData);
				});
		};
	}, [chatsData]);
	console.log("chats", chats)
	useEffect(() => {
		const adIdSelected = localStorage.getItem("ad-id_selected")
		adIdSelected && chats.length && revealHistory(adIdSelected);
	}, [chats]);

	const send = (e: FormEvent): void => {
		e.preventDefault();
		webSocket && webSocket.send(JSON.stringify({ senderId: myId, message }));
		setMessage("");
		// ws.send("Hello from Client1")
	};

	const save = () => {
		oldMessages.length &&
			axios.put("/api/chat", {
				messages: newMessages, id: chatId,
			})
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
	}, [newMessages, oldMessages]);

	const revealHistory = (el: string): void => {
		const relatedChat = chats.find(chat => chat.adId === el);
		setNewMessages([]);
		setOldMessages(relatedChat?.messages || []);
		setChatId(relatedChat?._id || "");
		setIsChatChosen(true);
	};

	return (
		<div className="chat-container">
			{loading ?
				<Backdrop
					className="backdrop"
					open={true}
				>
					<CircularProgress />
				</Backdrop> :
				<>
					<div className="interlocutors">
						{chats.map(chat => {
							const lastMessage = chat.messages[chat.messages.length - 1];
							return (
								<Paper
									className={`interlocutor ${chatId === chat._id ? "selected" : ""}`}
									onClick={() => revealHistory(chat.adId)}
								>
									<div className="images">
										{chat.adImage ?
											<div className="ad-image">
												<img src={`data:image/png;base64,${chat.adImage}`} />
											</div> :
											<NoPhotography className="no-photography" />
										}
										{chat.sellerImage ?
											<div className="seller-image">
												<img src={`data:image/png;base64,${chat.sellerImage}`} />
											</div> :
											<AccountCircle viewBox="2 2 20 20" className="account-circle" />
										}
									</div>
									<div className="sender-info">
										<Typography variant="h6">
											{chat.myInterlocutor?.name}
										</Typography>
										<Typography variant="h6">
											{chat.adTitle}
										</Typography>
										{lastMessage.senderId === myId ? `You: ${lastMessage.message}` : lastMessage.message}
									</div>
									<Delete />
								</Paper>
							);
						})}
					</div>
					<div className="chat-and-form">
						{isChatChosen ?
							<>
								<div className="chat">
									{allMessages.map(el => {
										return (
											<>
												{el.break &&
													<div className="break">
														<Paper>
															{el.break}
														</Paper>
													</div>
												}
												<Paper
													className={el.senderId === myId ? "sent-message" : "received-message"}
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
								<form onSubmit={send}>
									<TextField
										required
										type="text"
										size="small"
										variant="outlined"
										value={message}
										autoComplete="off"
										placeholder="Enter your Message"
										onChange={e => setMessage(e.target.value)}
										className="form-row"
									/>
									<IconButton type="submit">
										<Send />
									</IconButton>
								</form>
							</> :
							<div className="plug">
								<Typography variant="body1">
									Choose the Chat...
								</Typography>
							</div>
						}
					</div>
				</>
			}
			{/* <button onClick={save}></button> */}
		</div>
	);
};

export default Chats;