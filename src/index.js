var MimeTypes = require("mime-types"),
    Vue = require("vue");

Vue.filter("size", function(size) {
    var unitIndex = Math.floor(Math.log2(size) / Math.log2(1024));
    var unitText = [ "B", "KB", "MB", "GB", "TB", "PB" ][unitIndex];
    var unit = Math.pow(1024, unitIndex);
    var sizeInUnit = Math.round(size / unit * 10) / 10;
    return sizeInUnit + " " + unitText;
});

Vue.component("mip-entry", {
    props: [ "entry" ],
    template: `
        <div class="entry">
            <a class="name" href="{{entry.href}}">
                {{entry.name}}
            </a>
            <div v-if="entry.date" class="date">
                {{entry.date.toLocaleTimeString()}}<br>
                {{entry.date.toLocaleDateString()}}
            </div>
            <div class="info">
                {{entry.type}}
            </div>
            <div v-if="entry.size !== null" class="info">
                {{entry.size | size}}
            </div>
            <audio v-if="entry.category === 'audio'" :src="entry.href" controls preload="metadata" class="media"></audio>
            <img v-if="entry.category === 'image'" :src="entry.href" class="media">
            <video v-if="entry.category === 'video'" :src="entry.href" controls preload="metadata" class="media"></video>
        </div>
    `
});

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
            var category = MimeTypes.lookup(extension);
            if (category)
                category = category.split("/")[0];
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
            category,
            date,
            size
        });
    }
    index.sort(function(a, b) {
        return a.name.localeCompare(b.name);
    });
    return index;
}

function replaceBody(title, index) {
    document.body.innerHTML = null;
    new Vue({
        el: document.body,
        replace: false,
        data: { title, index },
        template: `
            <div class="index">
                <h1>{{title}}</h1>
                <mip-entry v-for="entry in index" :entry="entry" />
            </div>
        `
    });
}

replaceBody(document.title, buildIndexFromServerHTML());
