let eventSrc = new EventSource("https://api.gaminggeek.dev/realtime");
eventSrc.onmessage = function(res) {
    let data = JSON.parse(res.data);
    let guild = data.id;
    let members = document.getElementById(`${guild}-members`);
    try {
        members.innerHTML = `${data.members}&nbsp;Members`;
    } catch (e) {}
};
