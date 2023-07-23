import { useState, useRef, useEffect } from 'react'
import { FiUpload } from "react-icons/fi";
import Head from 'next/head'
import styles from '../styles/PDFViewer.module.css'
import { Viewer, Worker } from '@react-pdf-viewer/core';
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import CircularProgress from '@mui/material/CircularProgress';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
// import { SignOutButton, useAuth, useClerk } from "@clerk/nextjs";
import { RxCross1 } from "react-icons/rx";
import { GoSignOut } from 'react-icons/go';
import Link from 'next/link';


// const SignOutBtn = () => {
//   const { signOut } = useClerk();
//   return (
//     <GoSignOut onClick={() => signOut()} /> 
//   );
// };

export default function PDFViewer() {
    
    const [userInput, setUserInput] = useState("");
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([
        {
          "message": "Hey, I'm Apollo! How can I help?",
          "type": "apiMessage"
        }
      ]);
    const [pdfFile, setPdfFile] = useState(null);
    const [viewPdf, setViewPdf] = useState(null);
    const [selectedPdfFile, setSelectedPdfFile] = useState('');
    const messageListRef = useRef(null);
    const textAreaRef = useRef(null);
    const fileInputRef = useRef(null);
    const fileType = ['application/pdf'];
    const newplugin = defaultLayoutPlugin();
    // const { isLoaded, userId, sessionId, getToken } = useAuth();

    

    useEffect(() => {
        const messageList = messageListRef.current;
        messageList.scrollTop = messageList.scrollHeight;
      }, [messages]);
    
      // Focus on text field on load
      useEffect(() => {
        textAreaRef.current.focus();
      }, []);

    useEffect(() => {
        if (messages.length >= 3) {
          setHistory([[messages[messages.length - 2].message, messages[messages.length - 1].message]]);
        }
    }, [messages])

    const handleChange = (e) => {
        e.preventDefault();
        let selectedFile = e.target.files[0];
        console.log(selectedFile);
        if (selectedFile) {
            if (fileType.includes(selectedFile.type)) {
                
                setSelectedPdfFile(selectedFile);

                let reader = new FileReader();
                reader.readAsDataURL(selectedFile);
                reader.onload = async (e) => {
                    setPdfFile(e.target.result);
                    setViewPdf(e.target.result);
                }
                

            } else {
                // No PDF shows up
                setPdfFile(null);
                setViewPdf(null);
            }
        } else {
            // Not a PDF
            console.log("Please select a PDF file");
        }
    }

    const removeCurrentPDF = (e) => {
        e.preventDefault();
        setPdfFile(null);
        setViewPdf(null);
    }

    const handleEnter = (e) => {
        if (e.key === "Enter" && userInput) {
          if(!e.shiftKey && userInput) {
            handleSubmit(e);
          }
        } else if (e.key === "Enter") {
          e.preventDefault();
        }
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (userInput.trim() === "") {
          return;
        }
    
        setLoading(true);
        setMessages((prevMessages) => [...prevMessages, { "message": userInput, "type": "userMessage" }]);
        const formData = new FormData();
        formData.append('file', fileInputRef.current.files[0]);
        formData.append('question', userInput);
        formData.append('filename', "pdfFile");

        // // Send user question and history to API
        const response = await fetch('/api/pdfchat', {
          method: 'POST',
          body: formData,
        });
        console.log(response);
    
        // Handle errors
        const handleError = () => { 
          function errorHandling() {
            setMessages((prevMessages) => [...prevMessages, { "message": "There seems to be an error", "type": "apiMessage"}]);
            setLoading(false);
            setUserInput("");
          }
          errorHandling();
        }

        if (!response.ok) {
          handleError();
          return;
        }
    
        // Reset user input
        setUserInput("");
        const data = await response.json();
        
    
        if (data.result.error === "Unauthorized") {
          handleError();
          return;
        }
    
        setMessages((prevMessages) => [...prevMessages, { "message": data["result"]["text"], "type": "apiMessage" }]);
        setLoading(false);
        
    };

    return (
        <>
            <Head>
                <title>Apollo</title>
                <meta name="description" content="EffiLex Website Reader" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/navicon.ico" />
            </Head>
            <div className={styles.topnav}>
                <div className = {styles.navlogo}>
                    <Link href="/">Apollo</Link>
                </div>
                <div className = {styles.navlinks}>
                    <Link href="/">Websites</Link>
                    <Link href="/pdf">PDFs</Link>
                    {/* <SignOutBtn /> */}
                </div>
            </div>
            <main className={styles.main}>
                <div className={styles.mainSubOne}>
                    <div className={styles.fileChanger}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleChange}
                        />
                        <FiUpload className={styles.uploadBtn} onClick={() => fileInputRef.current.click()} size={30} />
                        {/* <input type="file" onChange={handleChange}></input> */}
                        <RxCross1 onClick={removeCurrentPDF} size={30}/>
                    
                    </div>
                    
                    <div className={styles.pdfSizer}>
                        <Worker workerUrl='https://unpkg.com/pdfjs-dist@3.8.162/build/pdf.worker.min.js'>
                            {viewPdf && <>
                                    <Viewer fileUrl={viewPdf} plugins={[newplugin]}></Viewer>
                                </>}
                            {!viewPdf && <>Add a PDF</>}
                        </Worker>
                    </div>
                </div>
                <div className={styles.mainSubTwo}>
        <div className = {styles.cloud}>
          <div ref={messageListRef} className={styles.messagelist}>
          {messages.map((message, index) => {
            return (
              // The latest message sent by the user will be animated while waiting for a response
                <div key = {index} className = {message.type === "userMessage" && loading && index === messages.length - 1  ? styles.usermessagewaiting : message.type === "apiMessage" ? styles.apimessage : styles.usermessage}>
                  {/* Display the correct icon depending on the message type */}
                  {message.type === "apiMessage" ? <Image src = "/navicon.ico" alt = "AI" width = "30" height = "30" className = {styles.boticon} priority = {true} /> : <Image src = "/usericon.png" alt = "Me" width = "30" height = "30" className = {styles.usericon} priority = {true} />}
                <div className = {styles.markdownanswer}>
                  {/* Messages are being rendered in Markdown format */}
                  <ReactMarkdown linkTarget = {"_blank"}>{message.message}</ReactMarkdown>
                  </div>
                </div>
            )
          })}
          </div>
        </div>
            <div className={styles.center}>
              
              <div className = {styles.cloudform}>
                
                <form onSubmit = {handleSubmit}>
                  <textarea 
                  disabled = {loading}
                  onKeyDown={handleEnter}
                  ref = {textAreaRef}
                  autoFocus = {false}
                  rows = {1}
                  maxLength = {512}
                  type="text" 
                  id="userInput" 
                  name="userInput" 
                  placeholder = {loading? "Waiting for response..." : "Type your question..."}  
                  value = {userInput} 
                  onChange = {e => setUserInput(e.target.value)} 
                  className = {styles.textarea}
                  />
                    <button 
                    type = "submit" 
                    disabled = {loading}
                    className = {styles.generatebutton}
                    >
                    {loading ? <div className = {styles.loadingwheel}><CircularProgress color="inherit" size = {20}/> </div> : 
                    // Send icon SVG in input field
                    <svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                  </svg>}
                  </button>
                </form>
              </div>
              
          </div>
        </div>
            </main>
            
        </>
    );
}