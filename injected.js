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
            var category = mimeTypeMap[extension.toLowerCase()];
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
        if (entry.category)
            $entry.classList.add("mime-" + entry.category);
        $link.setAttribute("href", entry.href);
        if (entry.date) {
            var date = getReadableTimestamp(entry.date).split("\n"),
                $date = makeEl({ className: "date", parentEl: $entry });
            for (var j in date)
                makeEl({ text: date[j], parentEl: $date });
        }
        $type = makeEl({ text: entry.type, className: "info", parentEl: $entry });
        if (entry.size)
            makeEl({ text: getReadableSize(entry.size), className: "info", parentEl: $entry });
        switch (entry.category) {
            case "audio":
                var $audio = document.createElement("audio");
                $audio.className = "media";
                $audio.setAttribute("src", entry.href);
                $audio.setAttribute("controls", true);
                $audio.setAttribute("preload", "metadata");
                $entry.appendChild($audio);
                break;
            case "image":
                if (entry.size < 2 * 1024 * 1024) {
                    var $image = document.createElement("img");
                    $image.className = "media";
                    $image.setAttribute("src", entry.href);
                    $entry.appendChild($image);
                }
                break;
            case "video":
                var $video = document.createElement("video");
                $video.className = "media";
                $video.setAttribute("src", entry.href);
                $video.setAttribute("controls", true);
                $video.setAttribute("preload", "metadata");
                $entry.appendChild($video);
                break;
        }
        $index.appendChild($entry);
    }
    return $index;
}

function run() {
    $html = makeHTML(buildIndexFromServerHTML());
    document.body.innerHTML = null;
    document.body.appendChild($html);
}

// Map generated from http://www.stdicon.com/mimetypes
// var mimeTypeMap = {}; for (var i in types) { var ext = Object.keys(types[i])[0].replace(/^./, ""); var type = types[i]["." + ext].replace(/\/.+$/, ""); mimeTypeMap[ext] = type; }
var mimeTypeMap = {"123":"application","3dml":"text","3g2":"video","3gp":"video","a":"application","aab":"application","aac":"audio","aam":"application","aas":"application","abw":"application","acc":"application","ace":"application","acu":"application","acutc":"application","adp":"audio","aep":"application","afm":"application","afp":"application","ai":"application","aif":"audio","aifc":"audio","aiff":"audio","air":"application","ami":"application","apk":"application","application":"application","apr":"application","asc":"application","asf":"video","asm":"text","aso":"application","asx":"video","atc":"application","atom":"application","atomcat":"application","atomsvc":"application","atx":"application","au":"audio","avi":"video","aw":"application","azf":"application","azs":"application","azw":"application","bat":"application","bcpio":"application","bdf":"application","bdm":"application","bh2":"application","bin":"application","bmi":"application","bmp":"image","book":"application","box":"application","boz":"application","bpk":"application","btif":"image","bz":"application","bz2":"application","c":"text","c4d":"application","c4f":"application","c4g":"application","c4p":"application","c4u":"application","cab":"application","car":"application","cat":"application","cc":"text","cct":"application","ccxml":"application","cdbcmsg":"application","cdf":"application","cdkey":"application","cdx":"chemical","cdxml":"application","cdy":"application","cer":"application","cgm":"image","chat":"application","chm":"application","chrt":"application","cif":"chemical","cii":"application","cil":"application","cla":"application","class":"application","clkk":"application","clkp":"application","clkt":"application","clkw":"application","clkx":"application","clp":"application","cmc":"application","cmdf":"chemical","cml":"chemical","cmp":"application","cmx":"image","cod":"application","com":"application","conf":"text","cpio":"application","cpp":"text","cpt":"application","crd":"application","crl":"application","crt":"application","csh":"application","csml":"chemical","csp":"application","css":"text","cst":"application","csv":"text","cu":"application","curl":"text","cww":"application","cxt":"application","cxx":"text","daf":"application","dataless":"application","davmount":"application","dcr":"application","dcurl":"text","dd2":"application","ddd":"application","deb":"application","def":"text","deploy":"application","der":"application","dfac":"application","dic":"text","diff":"text","dir":"application","dis":"application","dist":"application","distz":"application","djv":"image","djvu":"image","dll":"application","dmg":"application","dms":"application","dna":"application","doc":"application","docm":"application","docx":"application","dot":"application","dotm":"application","dotx":"application","dp":"application","dpg":"application","dsc":"text","dtb":"application","dtd":"application","dts":"audio","dtshd":"audio","dump":"application","dvi":"application","dwf":"model","dwg":"image","dxf":"image","dxp":"application","dxr":"application","ecelp4800":"audio","ecelp7470":"audio","ecelp9600":"audio","ecma":"application","edm":"application","edx":"application","efif":"application","ei6":"application","elc":"application","eml":"message","emma":"application","eol":"audio","eot":"application","eps":"application","epub":"application","es3":"application","esf":"application","et3":"application","etx":"text","exe":"application","ext":"application","ez":"application","ez2":"application","ez3":"application","f":"text","f4v":"video","f77":"text","f90":"text","fbs":"image","fdf":"application","fe_launch":"application","fg5":"application","fgd":"application","fh":"image","fh4":"image","fh5":"image","fh7":"image","fhc":"image","fig":"application","fli":"video","flo":"application","flv":"video","flw":"application","flx":"text","fly":"text","fm":"application","fnc":"application","for":"text","fpx":"image","frame":"application","fsc":"application","fst":"image","ftc":"application","fti":"application","fvt":"video","fzs":"application","g3":"image","gac":"application","gdl":"model","geo":"application","gex":"application","ggb":"application","ggt":"application","ghf":"application","gif":"image","gim":"application","gmx":"application","gnumeric":"application","gph":"application","gqf":"application","gqs":"application","gram":"application","gre":"application","grv":"application","grxml":"application","gsf":"application","gtar":"application","gtm":"application","gtw":"model","gv":"text","gz":"application","h":"text","h261":"video","h263":"video","h264":"video","hbci":"application","hdf":"application","hh":"text","hlp":"application","hpgl":"application","hpid":"application","hps":"application","hqx":"application","htke":"application","htm":"text","html":"text","hvd":"application","hvp":"application","hvs":"application","icc":"application","ice":"x-conference","icm":"application","ico":"image","ics":"text","ief":"image","ifb":"text","ifm":"application","iges":"model","igl":"application","igs":"model","igx":"application","iif":"application","imp":"application","ims":"application","in":"text","ipk":"application","irm":"application","irp":"application","iso":"application","itp":"application","ivp":"application","ivu":"application","jad":"text","jam":"application","jar":"application","java":"text","jisp":"application","jlt":"application","jnlp":"application","joda":"application","jpe":"image","jpeg":"image","jpg":"image","jpgm":"video","jpgv":"video","jpm":"video","js":"application","json":"application","kar":"audio","karbon":"application","kfo":"application","kia":"application","kil":"application","kml":"application","kmz":"application","kne":"application","knp":"application","kon":"application","kpr":"application","kpt":"application","ksh":"text","ksp":"application","ktr":"application","ktz":"application","kwd":"application","kwt":"application","latex":"application","lbd":"application","lbe":"application","les":"application","lha":"application","link66":"application","list":"text","list3820":"application","listafp":"application","log":"text","lostxml":"application","lrf":"application","lrm":"application","ltf":"application","lvp":"audio","lwp":"application","lzh":"application","m13":"application","m14":"application","m1v":"video","m2a":"audio","m2v":"video","m3a":"audio","m3u":"audio","m4u":"video","m4v":"video","ma":"application","mag":"application","maker":"application","man":"text","mathml":"application","mb":"application","mbk":"application","mbox":"application","mc1":"application","mcd":"application","mcurl":"text","mdb":"application","mdi":"image","me":"text","mesh":"model","mfm":"application","mgz":"application","mht":"message","mhtml":"message","mid":"audio","midi":"audio","mif":"application","mime":"message","mj2":"video","mjp2":"video","mlp":"application","mmd":"application","mmf":"application","mmr":"image","mny":"application","mobi":"application","mov":"video","movie":"video","mp2":"audio","mp2a":"audio","mp3":"audio","mp4":"video","mp4a":"audio","mp4s":"application","mp4v":"video","mpa":"video","mpc":"application","mpe":"video","mpeg":"video","mpg":"video","mpg4":"video","mpga":"audio","mpkg":"application","mpm":"application","mpn":"application","mpp":"application","mpt":"application","mpy":"application","mqy":"application","mrc":"application","ms":"text","mscml":"application","mseed":"application","mseq":"application","msf":"application","msh":"model","msi":"application","msl":"application","msty":"application","mts":"model","mus":"application","musicxml":"application","mvb":"application","mwf":"application","mxf":"application","mxl":"application","mxml":"application","mxs":"application","mxu":"video","n-gage":"application","nb":"application","nc":"application","ncx":"application","ngdat":"application","nlu":"application","nml":"application","nnd":"application","nns":"application","nnw":"application","npx":"image","nsf":"application","nws":"message","o":"application","oa2":"application","oa3":"application","oas":"application","obd":"application","obj":"application","oda":"application","odb":"application","odc":"application","odf":"application","odft":"application","odg":"application","odi":"application","odp":"application","ods":"application","odt":"application","oga":"audio","ogg":"audio","ogv":"video","ogx":"application","onepkg":"application","onetmp":"application","onetoc":"application","onetoc2":"application","opf":"application","oprc":"application","org":"application","osf":"application","osfpvg":"application","otc":"application","otf":"application","otg":"application","oth":"application","oti":"application","otm":"application","otp":"application","ots":"application","ott":"application","oxt":"application","p":"text","p10":"application","p12":"application","p7b":"application","p7c":"application","p7m":"application","p7r":"application","p7s":"application","pas":"text","pbd":"application","pbm":"image","pcf":"application","pcl":"application","pclxl":"application","pct":"image","pcurl":"application","pcx":"image","pdb":"application","pdf":"application","pfa":"application","pfb":"application","pfm":"application","pfr":"application","pfx":"application","pgm":"image","pgn":"application","pgp":"application","pic":"image","pkg":"application","pki":"application","pkipath":"application","pl":"text","plb":"application","plc":"application","plf":"application","pls":"application","pml":"application","png":"image","pnm":"image","portpkg":"application","pot":"application","potm":"application","potx":"application","ppa":"application","ppam":"application","ppd":"application","ppm":"image","pps":"application","ppsm":"application","ppsx":"application","ppt":"application","pptm":"application","pptx":"application","pqa":"application","prc":"application","pre":"application","prf":"application","ps":"application","psb":"application","psd":"image","psf":"application","ptid":"application","pub":"application","pvb":"application","pwn":"application","pwz":"application","py":"text","pya":"audio","pyc":"application","pyo":"application","pyv":"video","qam":"application","qbo":"application","qfx":"application","qps":"application","qt":"video","qwd":"application","qwt":"application","qxb":"application","qxd":"application","qxl":"application","qxt":"application","ra":"audio","ram":"audio","rar":"application","ras":"image","rcprofile":"application","rdf":"application","rdz":"application","rep":"application","res":"application","rgb":"image","rif":"application","rl":"application","rlc":"image","rld":"application","rm":"application","rmi":"audio","rmp":"audio","rms":"application","rnc":"application","roff":"text","rpm":"application","rpss":"application","rpst":"application","rq":"application","rs":"application","rsd":"application","rss":"application","rtf":"application","rtx":"text","s":"text","saf":"application","sbml":"application","sc":"application","scd":"application","scm":"application","scq":"application","scs":"application","scurl":"text","sda":"application","sdc":"application","sdd":"application","sdkd":"application","sdkm":"application","sdp":"application","sdw":"application","see":"application","seed":"application","sema":"application","semd":"application","semf":"application","ser":"application","setpay":"application","setreg":"application","sfd-hdstx":"application","sfs":"application","sgl":"application","sgm":"text","sgml":"text","sh":"application","shar":"application","shf":"application","si":"text","sic":"application","sig":"application","silo":"model","sis":"application","sisx":"application","sit":"application","sitx":"application","skd":"application","skm":"application","skp":"application","skt":"application","sl":"text","slc":"application","sldm":"application","sldx":"application","slt":"application","smf":"application","smi":"application","smil":"application","snd":"audio","snf":"application","so":"application","spc":"application","spf":"application","spl":"application","spot":"text","spp":"application","spq":"application","spx":"audio","src":"application","srx":"application","sse":"application","ssf":"application","ssml":"application","stc":"application","std":"application","stf":"application","sti":"application","stk":"application","stl":"application","str":"application","stw":"application","sus":"application","susp":"application","sv4cpio":"application","sv4crc":"application","svd":"application","svg":"image","svgz":"image","swa":"application","swf":"application","swi":"application","sxc":"application","sxd":"application","sxg":"application","sxi":"application","sxm":"application","sxw":"application","t":"text","tao":"application","tar":"application","tcap":"application","tcl":"application","teacher":"application","tex":"application","texi":"application","texinfo":"application","text":"text","tfm":"application","tgz":"application","tif":"image","tiff":"image","tmo":"application","torrent":"application","tpl":"application","tpt":"application","tr":"text","tra":"application","trm":"application","tsv":"text","ttc":"application","ttf":"application","twd":"application","twds":"application","txd":"application","txf":"application","txt":"text","u32":"application","udeb":"application","ufd":"application","ufdl":"application","umj":"application","unityweb":"application","uoml":"application","uri":"text","uris":"text","urls":"text","ustar":"application","utz":"application","uu":"text","vcd":"application","vcf":"text","vcg":"application","vcs":"text","vcx":"application","vis":"application","viv":"video","vor":"application","vox":"application","vrml":"model","vsd":"application","vsf":"application","vss":"application","vst":"application","vsw":"application","vtu":"model","vxml":"application","w3d":"application","wad":"application","wav":"audio","wax":"audio","wbmp":"image","wbs":"application","wbxml":"application","wcm":"application","wdb":"application","wiz":"application","wks":"application","wm":"video","wma":"audio","wmd":"application","wmf":"application","wml":"text","wmlc":"application","wmls":"text","wmlsc":"application","wmv":"video","wmx":"video","wmz":"application","wpd":"application","wpl":"application","wps":"application","wqd":"application","wri":"application","wrl":"model","wsdl":"application","wspolicy":"application","wtb":"application","wvx":"video","x32":"application","x3d":"application","xap":"application","xar":"application","xbap":"application","xbd":"application","xbm":"image","xdm":"application","xdp":"application","xdw":"application","xenc":"application","xer":"application","xfdf":"application","xfdl":"application","xht":"application","xhtml":"application","xhvml":"application","xif":"image","xla":"application","xlam":"application","xlb":"application","xlc":"application","xlm":"application","xls":"application","xlsb":"application","xlsm":"application","xlsx":"application","xlt":"application","xltm":"application","xltx":"application","xlw":"application","xml":"application","xo":"application","xop":"application","xpdl":"application","xpi":"application","xpm":"image","xpr":"application","xps":"application","xpw":"application","xpx":"application","xsl":"application","xslt":"application","xsm":"application","xspf":"application","xul":"application","xvm":"application","xvml":"application","xwd":"image","xyz":"chemical","zaz":"application","zip":"application","zir":"application","zirz":"application","zmm":"application"};
mimeTypeMap["webp"] = "image";
mimeTypeMap["webm"] = "video";
run();
