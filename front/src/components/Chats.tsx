import { useState, useContext, FC, FormEvent } from "react";
import { Backdrop, TextField, IconButton, Paper, Typography, CircularProgress } from "@mui/material";
import { AccountCircle, Send } from "@mui/icons-material";
import { useEffect } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";
import { MessageType, ChatType, BriefAdType, ModifiedChatType, SellerType } from "../types";

const Chats: FC = () => {
	const [oldMessages, setOldMessages] = useState<Array<MessageType>>([]);
	const [newMessages, setNewMessages] = useState<Array<MessageType>>([]);
	const [allMessages, setAllMessages] = useState<Array<MessageType>>([]);
	const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
	const [message, setMessage] = useState("");
	const [chatId, setChatId] = useState<string>("");
	const [chatsData, setChatsData] = useState<Array<ChatType>>([]);
	const [chats, setChats] = useState<Array<ModifiedChatType>>([]);
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

	console.log("oldMessages", oldMessages);

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
			const modifiedChatsData: Array<ModifiedChatType> = chatsData.map(chatData => {
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
						data.map((ad: BriefAdType): void => {
							if (chat.adId === ad._id) {
								modifiedChatsData[i] = {
									...chat,
									adImage: ad.images[0].data,
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
						data.map((seller: SellerType) => {
							if (chat.myInterlocutor?.id === seller._id) {
								modifiedChatsData[i] = {
									...chat,
									sellerImage: seller.image.data,
								};
							};
						});
					});
					setChats(modifiedChatsData);
				});
		};
	}, [chatsData]);

	useEffect(() => {
		const adIdSelected = localStorage.getItem("ad-id_selected")
		adIdSelected && chats.length && revealHistory(adIdSelected);
	}, [chats]);
	console.log("chats", chats);

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
		console.log("www")
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
		<div className="chat_container">
			{loading ?
				<Backdrop
					className="loading_backdrop"
					open={true}
				>
					<CircularProgress className="loading" />
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
									<div className="images_container">
										<div className="ad_image">
											<img src={`data:image/png;base64,${chat.adImage}`} />
										</div>
										{chat.sellerImage ?
											<div className="seller_image">
												<img src={`data:image/png;base64,${chat.sellerImage}`} />
											</div> :
											<AccountCircle className="interlocutor_image" />
										}
									</div>
									<div className="sender_info">
										<Typography variant="h6">
											{chat.myInterlocutor?.name}
										</Typography>
										<Typography variant="h6">
											{chat.adTitle}
										</Typography>
										{lastMessage.senderId === myId ? `You: ${lastMessage.message}` : lastMessage.message}
									</div>
								</Paper>
							);
						})}
					</div>
					<div className="chat_and_form">
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
													className={el.senderId === myId ? "sent_message" : "received_message"}
												>
													{el.message}
													<>
														{el.creationDate && new Date(el.creationDate)
															.toLocaleTimeString("en-US", {
																hour: "numeric",
																minute: "numeric"
															})
														}
													</>
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
										className="form_row"
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