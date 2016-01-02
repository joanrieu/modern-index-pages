function buildIndexFromServerHTML() {
    var links = document.getElementsByTagName("a");
    var index = [];
    for(var i = 0; i < links.length; ++i) {
        var href = links[i].getAttribute("href");
        var name = decodeURIComponent(href.replace(/\/$/, "").split("/").pop());
        if (links[i].textContent === "Parent Directory") // apache
            name = ".."; // nginx
        var isDirectory = href[href.length - 1] == "/";
        if (!isDirectory) {
            var parts = name.split(".");
            var extension = parts.pop();
            name = parts.join(".");
        }
        var infoText = links[i].nextSibling.textContent.trim();
        var date = infoText.match(/[0-9]{2}-[A-Z][a-z]{2}-[0-9]{4} [0-9]{2}:[0-9]{2}/);
        if (date)
            date = new Date(date[0]);
        var size = infoText.match(/[0-9]+$/); // nginx (bytes like 1234567)
        if (size)
            size = parseInt(size[0]);
        else {
            size = infoText.match(/[0-9]+(\.[0-9]+)?\w?$/); // apache (formatted like 3.1M)
            if (size) {
                size = size[0];
                var unitIndex = 1 + [ "K", "M", "G", "T", "P" ].indexOf(size[size.length - 1]);
                var unit = Math.pow(1024, unitIndex);
                size = Math.round(parseFloat(size) * unit);
            }
        }
        index.push({
            name,
            href,
            type: isDirectory ? "DIR" : extension.toUpperCase(),
            date,
            size
        });
    }
    index.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    return index;
}

function makeEl(details) {
    var el = document.createElement(details.elName || "div");
    if (details.className)
        el.className = details.className;
    if (details.text)
        el.textContent = details.text;
    if (details.parentEl)
        return details.parentEl.appendChild(el);
    else
        return el;
}

function getReadableTimestamp(date) {
    return date.toLocaleTimeString() + "\n" + date.toLocaleDateString();
}

function getReadableSize(size) {
    var unitIndex = Math.floor(Math.log2(size) / Math.log2(1024));
    var unitText = [ "B", "KB", "MB", "GB", "TB", "PB" ][unitIndex];
    var unit = Math.pow(1024, unitIndex);
    var sizeInUnit = Math.round(size / unit * 10) / 10;
    return sizeInUnit + " " + unitText;
}

function makeHTML(index) {
    var $index = makeEl({ className: "index" });
    makeEl({ text: document.title, elName: "h1", parentEl: $index });
    for (var i in index) {
        var entry = index[i],
            $entry = makeEl({ className: "entry", parentEl: $index }),
            $link = makeEl({ text: entry.name, elName: "a", className: "name", parentEl: $entry });
        $link.setAttribute("href", entry.href);
        if (entry.date) {
            var date = getReadableTimestamp(entry.date).split("\n"),
                $date = makeEl({ className: "date", parentEl: $entry });
            for (var j in date)
                makeEl({ text: date[j], parentEl: $date });
        }
        makeEl({ text: entry.type, className: "info", parentEl: $entry });
        if (entry.size)
            makeEl({ text: getReadableSize(entry.size), className: "info", parentEl: $entry });
        $index.appendChild($entry);
    }
    return $index;
}

document.body.innerHTML = makeHTML(buildIndexFromServerHTML()).outerHTML;
