const generateMessage = (username, url)=>{

    return {
        username,
        url,
        createdAt: new Date().getTime()
    }

}

export default generateMessage; 