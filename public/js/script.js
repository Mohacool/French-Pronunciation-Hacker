

// $(".logo").on('click',function(){
//     alert('Your real dimensions are:'+screen.width+' by '+screen.height);
//     alert('Your window dimensions are:'+window.innerWidth+' by '+window.innerHeight);
// })
// $(".mobiletitle").on('click',function(){
//     alert('Your real dimensions are:'+screen.width+' by '+screen.height);
//     alert('Your window dimensions are:'+window.innerWidth+' by '+window.innerHeight);
// })
// $(".desktoptitle").on('click',function(){
//     alert('Your real dimensions are:'+screen.width+' by '+screen.height);
//     alert('Your window dimensions are:'+window.innerWidth+' by '+window.innerHeight);
// })


var daily_objective = JSON.parse(localStorage.getItem('daily_objective'));
if (!(localStorage.getItem('daily_objective'))){
    daily_objective = 10;
}
else{
    $('.timer').html(daily_objective+":"+"00");
}

var timer_started = false;



// Load the scroll bar js/css only if SCREEN WIDTH > 420px
if (screen && screen.width > 420) {
    // alert('loaded css');
    document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.css"\/>');
    document.write('<script src="https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.js"><\/script>');
}

var audio = new Audio('assets/correct.wav');

// Change the story height
// var mainrowheight = window.innerHeight-$('.logo').height();
// $(".mainrow").css({'height':mainrowheight+'px'});
// console.log('main row set to'+mainrowheight);

// =============================== BUTTONS ===========================================
var mic_on_color = "rgb(220,64,53)";
var mic_off_color = "#156d74"

$(".circle").mousedown(function(){
    console.log('holding.....');
    $(".circle").css({'background':mic_on_color});
    // $('#status').text('Recording started: (mouse)');

    startRecording();
});

$(".circle").mouseup(function() {
    $(".circle").css({'background':mic_off_color});
    console.log('released');
    // $('#status').text('Recording stopped: (mouse)');
    stopRecording();
});

$('#status').text('');

$(".circle").on('touchstart', function(e){
    e.preventDefault();

    console.log('holding.....');
    $(".circle").css({'background':mic_on_color});
    // $('#status').text('Recording started: (touch)');
    startRecording();
});

$(".circle").on('touchend', function(e){
    e.preventDefault();
    $(".circle").css({'background':mic_off_color});
    // $('#status').text('Recording stopped: (touch)');
    console.log('released');
    stopRecording();
});
$('#status').text('');

// Play button 
var play = false;
$('.playbutton').on('click',function(){
    //Play
    if (play==false){
        $('.play_arrow').attr('style','display: none !important');
        $('.pause').attr('style','display: block !important');
        play=true;
        player.play();
    }
    // Pause
    else{
        $('.pause').attr('style','display: none !important');
        $('.play_arrow').attr('style','display: block !important');
        play=false;
        player.pause();
    }
   
    // $(".circle").css({'background':mic_off_color});
    
})

// Skip and Rewind buttons
$('.leftrewind').on('click',function(){
    player.rewind(5);
})

$('.rightrewind').on('click',function(){
    player.forward(5);
})


// =============================== BUTTONS ===========================================

var checkpoints = [14,41,71,117,141,175,185,222,228,249,257,266,273,282,294];


// let transcript_length = my_transcript.length;
// console.log(my_transcript);

// Main single word homophone dictionary
var homophone_dict = { 'a': ['Ah','à'], 'à': ['Ah'], 'à bord': ['adore'], 'enfance':['enfant'], 'agite': ['àgîtes'], 'aiment': ['M'], 'anciens': ['ancien'], 'ans': ['en'], 'appelé': ['appeler'], 'arrangez': ['arranger'], 'arrivé': ['arrivée'], 'arrivées': ['arrivé','arrivés'], 'arriver': ['arrivée', 'arrivé', 'arrivées'], 'au': ['Oh'], 'aux': ['Oh','au'], 'aux hommes': ['awesome'], 'avons': ['avant'],'avance':['avant'],'alors':['allô'], 'bateau': ['bâteau'], 'beaux': ['beau'],'bord':['bon'], 'bonnes': ['bonne'], 'brave': ['AvePAF'], 'bruns': ['brun'], 'calme': ['Cannes'], 'caractéristique': ['caractéristiques'], 'cause': ['COS'], 'cérébrale': ['cérébral'],'capitaine':['capitale'],'certaines':['certains'], 'cet ': ['7', 'cette'], 'cette': ['7'], 'ciel': ['sur'], 'combattre':['combat'], 'commencé': ['commencer'], 'commencent': ['commence'], 'composent': ['compose'], 'conseils': ['conseil'], 'contrôlé': ['contrôler'], 'crie': ['cri','prix'], 'curieuses': ['curieuse'],"demandent":["demande"], "d'Elbe": ['Dalbe', 'soldes', 'Delvaux', 'Dell', 'bébé'], "d'évolution": ['devolution'], "d'honneur": ['donneur', 'toner'], 'd’anxiété': ["d'anxiété","densité"], 'Danglars': ['latangla', 'Tangara', 'dollar', 'tongars', 'peignoir', 'Danglard', 'standard', 'Danglars'], 'dans': ['temps','don'], 'dantès': ['Dantès', 'dentaire', 'Dante', 'danstes', 'tenter','dans'], 'de': ['2'], 'désirez': ['désiré'], 'détestent': ['déteste'], 'dit': ['10', 'mets'], 'dites': ['dit'], 'dix': ['10'], 'dix-neuf': ['19'], 'doit': ['doigt', 'toi'], 'donnent': ['donne'],'donne':['dans'], 'du port': ['duporc'], 'Edmond': ['Edmonde', 'etdemain'], 'Eh': ['et'], 'elles': ['elle'], 'en': ['on','a'], 'équipements': ['équipement'], 'est': ['et'], 'fait': ['fais'], 'francs': ['franc'], 'gestes': ['geste'], 'grand': ['quand', 'Groscon', 'Cran', 'camp'], 'habitués': ['habitué'], 'haine': ['n'], 'Hé': ['et'], 'heures': ['heure'], 'homme': ['femme'], 'hommes': ['homme', 'femme'], 'honnête': ['ponette'], 'honore': ['Honor'], 'huit': ['8', 'oui'], 'ils': ['il'], 'inattendue': ['inattendu'], 'intelligents': ['intelligent'], 'je': ['jeux'], 'jetant': ["jet'en"], 'jeune homme': ['jeunefemme'], 'jours': ['jour'], "l'île": ['Lille'], 'leclère': ['leclerc'], 'les': ['mets'], 'leur': ["l'heure"], 'livrées': ['livret'], 'livrées en': ['livretA'], 'longue': ['langue'], 'lui': ['nuit'], 'M': ['monsieur', 'M', 'aime'], 'main': ['mets'], 'Mais': ['mets'], 'malheur': ['alors'], 'manière': ['panière'], 'marchandise': ['marchandises'], 'marchandises': ['marchandise'], 'marins': ['marin'], 'monsieur': ['monsieur', 'Monster', 'monsieur', 'bonnesœur', 'masœur'], 'monte': ['Nantes', 'menthe'], 'Morell': ['Morel'], 'mort': ['Marc', 'Laure', 'alors', 'nord'], 'mortels': ['mortel'],'morrel':['morel'], 'mouvement ': ['ouvreman'], "n'a": ['na', 'non'], "n'est-ce pas": ['néo', 'mets', 'LaCiotat'], "n'y": ['ni'], 'noirs': ['noir'], 'nouvel': ['nouvelle'], 'obéissent': ['obéisse'], 'ordinaires': ['ordinaire'], 'ordres': ['ordre', 'odre'], 'organisé': ['organiser'], 'ou': ['où'], 'personnes': ['personne'], 'peut': ['peu'], 'plate-forme': ['plateforme'],'plateforme':['plate-forme'], 'point': ['.'], 'port':['porc'], 'préparez': ['préparer'], 'près': ['prêt','prix'], 'pressé': ['presser'], 'pris': ['prix'], 'promets': ['promet'], "Qu'est-ce": ['caisse'], "qu'ils": ["qu'il"], "qu'on": ['con'], 'quitte': ['kit'], 'quitté': ['quitter'], 'rapides': ['rapide'], 'rapportons': ['rapportant'], 'rassuré': ['rassurer'], 'répond': ['réponds'],'regardant':['regardons'],'répond': ['réponds'], 'réponds': ['répond'], 'revient': ['reviens'], "s'exécute": ["c'estquec'estculte", 'sexycute', 'sexeécoute'], 'sa': ['ça'], 'saisit': ['saisie'], 'sans': ['100'], 'savez': ['savais', 'çafait', 'avec'], 'se': ['ce'], 'se demandent': ['se demande'], 'serez': ['serai'], 'ses': ["c'est"], 'si': ['6'], 'sombre': ['sandre', 'semble', 'Sambre', 'centre'], 'sommes': ['Sam'], 'sont': ['100', 'son'], 'sort': ['Saur', 'Sarah'], 'souffrances': ['souffrance'], 'soulagé': ['soulager'], 'spectateurs': ['spectateur'], 'statut': ['statue'], 'subordonnés': ['subordonnée'], 'supérieurs': ['supérieur'], 'tombé': ['tomber'], 'tous': ['tu'], 'tout': ['tu'], 'toutes': ['tout'], 'travaille': ['travail'], 'très': ['prêt'], 'triste': ['test'], 'trois': ['3'], 'un': ['1'], 'vécu': ['déçu'], 'vers': ['verre'], 'vie': ['v'], 'vingt-cinq': ['25', '20V'], 'vois': ['voix'], 'voulez': ['boulet', 'voulais'], 'vous': ['veau', 'faux'], 'yeux': ['mieux', 'Dieu']};


// Homophones that <EXIST> in the story as multiple words
var homophone_multiword_dict = {'aux hommes':['ozone','ozon','awesome'],'à bord':['adore']};
var multiword_catcher = ['aux','à'];

// OLD 
var annotated_words=["bateau","se demandent","marin","Il a l’air calme","Crie","à bord","malheur","soulagé","la mer","obéissent","inattendue","épée","survécu","voilà","le comptable","dextérité","saisit","laisse","surtout","des conseils","en jetant un regard","haine","l'île d'Elbe","au lieu de"];
var annotated_meanings = ["a boat","to ask oneself / to wonder","a sailor / a seaman ","il semble calme = he looks calm","to yell","on board","un problème = a misfortune","rassuré = relieved","the sea","obéir = to obey","unexpected","une épée = a sword","survived (verbe: survivre)","here is…","the accountant","agilité","to seize","laisser = to let / to give","above all","advices (masculin)","take a look","hatred / anger","l'île d'Elbe est fameuse pour être l'île d'exil de Napoléon en 1814-15","instead of"];
// NEW
var annotated_words = ['bateau', 'se demandent', 'marin', "Il a l'air calme", 'Crie', 'à bord', 'malheur', 'soulagé', 'la mer', 'obéissent', 'inattendue', 'épée', 'survécu', 'voilà', 'le comptable', 'dextérité', 'saisit', 'laisse', 'surtout', 'des conseils', 'en jetant un regard', 'haine', "l'île d'Elbe", 'au lieu de', 'il a eu tort', 'aussi bien que moi', 'aller à terre', "l'ancre", 'fait un pas', 'Napoléon', 'selon', 'Morrell et fils', 'vieillard', "à n'importe qui", 'voilà les', "je dois m'occuper d'eux", 'vous permettez', 'bien que', 'enfermé', 'rien ne lui manque', 'retarder', 'mes affaires', 'un congé', 'faites attention', 'vous venez juste de répondre', 'les larmes aux yeux', 'la comptabilité', 'Cela dépend du sens', "j'ai eu tort", 'voyons', 'en tout point', 'Néanmoins', 'son génie de la haine', 'inquiet', "je ne t'attendais", 'Allez', 'tant mieux', 'Seigneur', 'en effet', 'on dirait', 'francs', 'murmure', 'se jetant à genoux', 'déchiré', 'tout de suite', "c'est-à-dire", "s'éclaire", 'une boite', 'des lèvres', 'peu importe', 'barbue', 'tailleur', 'léger', 'tellement', 'en jetant un œil', 'pièces', 'négligemment', 'bourse', "j'avais hâte", "on a tort", 'Tant mieux', 'fera plaisir', "ne manquent pas d'amoureux", 'sous lequel', 'fidèle', 'peu importe', 'il est trop pressé', 'il me semble', 'banquier', 'peut-être même', 'ce quartier', 'les nouvelles'];
var annotated_meanings = ['a boat', 'to ask oneself / to wonder', 'a sailor / a seaman', 'il semble came = he looks calm', 'crier = to yell', 'on board', 'un problème = a mistfortune', 'rassuré = relieved', 'the sea', 'obéir = to obey', 'unexpected', 'une épée = a sword', 'survived (verbe: survivre)', 'here is…', 'the accountant', 'agilité', 'to seize', 'laisser = to let / to give', 'above all', 'advices (masculin)', 'take a look', 'hatred / anger', "l'île d'Elbe est fameuse pour être l'île d'exil de Napoléon en 1814-15", 'instead of', 'avoir tort = to be wrong', 'as good as me', 'go ashore', 'une ancre = a anchor', 'faire un pas en arrière = take a step back', "l'Empereur = Napoléon ; exilé en 1815", 'according to', 'Morrel and sons', 'old man', 'to anyone', 'here are the ', 'I have to take care of them', 'would you mind ?', 'although', 'locked up', 'nothing is missing to him', 'to delay', 'my business', 'des vacances', 'be careful', 'you just answered ', 'tears in the eyes', 'the accounting ', 'it depends on the meaning', 'I was wrong', "let's see ", 'in every way', 'nevertheless', 'his evil genius', 'worried', "I wasn't expecting you", 'allez ! = come on ! ', 'good', 'Dieu', 'indeed', 'it looks like', 'Le franc : ancienne unité monétaire de France ', 'to whisper / to murmur', 'throw oneself on the knees', 'tear the heart ', 'right now', 'that is to say', 'light up', 'a box', 'lips', 'whatever', 'avec une barbe = with a beard', 'a tailor', 'light / small', 'so much', 'taking a look', 'the coins', 'négliger = to neglect', 'a purse', 'avoir hâte = to look forward to', 'one is wrong to', 'all good', 'faire plaisir = to please', "don't lack lovers", 'under which', 'faithful', 'whatever / anyway', 'être pressé = to be in a hurry', ' it seems to me', 'banker', 'maybe even less', 'this neighborhood', 'news'];

var numbers=["vingt-quatre","mille-huit-cent-quinze"];

var audio_words = ["monsieur","est-il","Naples","survécu","laisse","comptable","l’eau","semble","Immédiatement"];
var audio_files = ["monsieur.mp3","est-il.mp3","Naples.mp3","survécu.mp3","laisse.mp3","comptable.mp3","leau.mp3","semble.mp3","Immédiatement.mp3"];

/*
$.ajax({
    
    url: "assets/chapter1to4.txt",
    dataType: "text",
    async: false,
    success: (content) => {

        // alert(content.length);
        console.log(content);
        let lines=content.split('\n');

        // var chapters = ["1 L’ARRIVÉE"];

        lines = lines.slice(1,); // Remove title
        

        // lines = lines.map( element => element.replace("",'<br>'));

        console.log(lines.length)

        lines = lines.filter(e=> e.length!=1);

        console.log(lines.length)

       
        lines = lines.map( element => element.replace("*",'&emsp;&emsp;'));
        lines = lines.map( element => element.replace("    ",'&emsp;&emsp;'));
        lines = lines.map(element => element+"<br><br>");

        console.log(lines);

        // lines = lines.map(element => element.replace("«","<br>«"));
        $("#chapter_title").html("1 L’ARRIVÉE");


        console.log("linesblue------------------");
        console.log(lines);

       

        lines = lines.join(" ");
        console.log("Checkpoint1-----------------");
        console.log(lines);

        console.log(lines.length);

        // Go through every annotation in annotation_list and replace the annotations in the big string

        annotated_words.forEach(function (word, i) {

            // Gets the full annotation ex: sailor[1]
            let annot_number = i +1;
            let full_annotation = word+"["+annot_number+"]";
            console.log(full_annotation);

            if (!lines.includes(full_annotation)){
                console.log("#########################",full_annotation);
                full_annotation = full_annotation.replace("'","’");
            }
            console.log(full_annotation);
            
            // in the loop keep replacing blah[1],blah[2],blah[3]....
            lines = lines.replace(full_annotation,
                `<span class='annotate ${annot_number}' data-toggle="tooltip" data-placement="top" title="Tooltip on top">
                ${word}</span>`);
            
        })
        console.log(lines);


        // Add number annotations manually (this can be made into a loop later)
        lines = lines.replace("24","<span class='annotate number1' data-toggle='tooltip' data-placement='top' title='vingt-quatre'>24</span>");
        lines = lines.replace("1815,","<span class='annotate number2' data-toggle='tooltip' data-placement='top' title='mille-huit-cent-quinze'>1815,</span>");

       // Add audio annotations manually (this can be made into a loop later)
       audio_words.forEach(function (audio_word, index){    
            lines = lines.replace(audio_word,`<span onclick="playAudio('assets/audio/${audio_files[index]}')" class='audio' data-toggle='tooltip' data-placement='top' title="<img src='assets/audio.png' height='30px'/>" >${audio_word}</span>`);

       })
    //    lines = lines.replace("monsieur",`<span onclick="playAudio('audio/monsieur.mp3')" class='audio audio1' data-toggle='tooltip' data-placement='top' title="<img src='audio.png' height='30px'/>" >monsieur</span>`);
    //    lines = lines.replace("est-il",`<span onclick="playAudio('audio/est-il.mp3')" class='audio audio1' data-toggle='tooltip' data-placement='top' title="<img src='audio.png' height='30px'/>" >est-il</span>`);


        
        // put all the computed html into the story
        //$("#story").html(lines);
    }
    
    
})
*/
$.ajax({
    // url: "assets/chapter1new.txt",
    url: "assets/storycomplete.txt",
    dataType: "text",
    async: false,
    success: (content) => {
        $('#story').html(content);
    }

})

// Try speeding up read in already done txt

var sentence = $("#story").text(); // Fetch the story from the html 
console.log(sentence);

var words = sentence.split(" ");

// Filter round 1
words = words.filter(word => word!="«" && word!="»").filter(e=> e!="" && e!="  ").filter(e=> e!="\n");

words = words.filter(word=> word!="»\n");



console.log("words->");
console.log(words);


var at_wrd = 0;

var dict = {};
var skipped_indeces = [];

options = {
    
    "exclude":["mark"], 
    "filter": function(textNode, foundTerm, totalCounter){
        if (totalCounter<=0){
            return true;
        }
    },
    "ignorePunctuation":[",",".","'","’"]
}

skip_options = {
    
    "exclude":["mark"], 
    "filter": function(textNode, foundTerm, totalCounter){
        if (totalCounter<=0){
            return true;
        }
    },
    className: "highlight",
    "ignorePunctuation":[",",".","'","’"]
}

// Highlights up to num_words, and skipping the words in skip_indeces
function highlight(num_words,skip_indeces){

    console.log("=========HIGHLIGHT COMMENCING=========");
    at_wrd = num_words;
    for (i=0;i<num_words;i++){
        let mark = words[i].replace("'","’").replace(",","").replace("?","");
        if (skip_indeces.includes(i+1)){
            $('#story').mark(mark,skip_options);
        }
        else{
            $('#story').mark(mark,options);
        }

    }
}


$(".reset").on('click',function(){
    localStorage.setItem('words_completed',0);
    localStorage.setItem('skipped_words',[]);
    update_progress();
    location.reload();

})

$(".skipword").on('click',function(){

    
    
    skipped_indeces.push(at_wrd+1); // keep track of which words were skipped 

    // Set the localstorage variable => Use JSON.parse to get list back

    // If signed in
    if (token!=null){
        var old_skipped_words;
        if (localStorage.getItem('skipped_words').length==0){
            old_skipped_words = [];
        }
        else{
            old_skipped_words = JSON.parse(localStorage.getItem('skipped_words'));
        }
        // if already filled then append old to new 
        if (old_skipped_words.length >=1){

            // Merge the old indices with new and remove duplicates
            const full_skipped_words = [...new Set([...old_skipped_words,...skipped_indeces])];

            localStorage.setItem('skipped_words', JSON.stringify(full_skipped_words));
        }
        // if empty then create it
        else{
            // if not then create (setItem)
            localStorage.setItem('skipped_words', JSON.stringify(skipped_indeces));
        }
        
        console.log('old');
        console.log(localStorage.getItem('skipped_words'));

        console.log('new');
        console.log(skipped_indeces);

        
    }

    // alert('at word '+words[at_wrd]+' and skipping');
    $('#skippedwordslist').append(`<li>${words[at_wrd]}</li>`);

    // $("#story").mark(words[at_wrd],{
    //     accuracy:'exactly',
    //     className: "highlight"
    // });

    let mark_word = words[at_wrd].replace("'","’").replace(",","").replace("?","");
    // console.log("this going in: " + mark_word);
    $('#story').mark(mark_word,skip_options);

    // Dec 1 changed
    // $('#story').mark(words[at_wrd],skip_options);


    at_wrd +=1; // increment the word count

    if (!(timer_started)){
        countdown("ten-countdown", daily_objective, 0 );
    }

    // If signed in 
    if (token !=null){
        localStorage.setItem('words_completed',at_wrd); // store the words_completed in local
        checkpoint_update(at_wrd); // Update the progress if at_wrd is a checkpoint
    }
    


})

function checkpoint_update(word_num){
    // If the word number is in the list of checkpoints then update the progress
    if (checkpoints.includes(word_num)){
        update_progress();
    }
}

function canalyse(transcript){
    console.log('canalyse run');
    // Split up the words detected
    var words_detected = transcript.split(" ");

    // Clean it up
    words_detected = words_detected.filter(function(e){return e }); 

    words_detected.forEach(function (item, index) {
        var detected_word = item.toLowerCase();

        // detected_word = detected_word.replace("'","’"); //added jan23 2021
        
        // Actual word that is in the HTML
        var actual_word = words[at_wrd];
        
        // Cleaned up word used for comparison
        var stripped_word = words[at_wrd].replace(/[.,\/#!$%\^&\*;:{}=_`~()«»]/g,"").toLowerCase().trim();

        stripped_word = stripped_word.replace("’","'").replace(",","").replace("?",""); // jan23 2021 removed
        // stripped_word = stripped_word.replace(",",""); //Fix different apostrophe error

        console.table("Detected: " + detected_word, "Stripped: ",stripped_word);

        var in_multiword_dict = multiword_catcher.indexOf(stripped_word)!=-1;
        
        

        if (detected_word==stripped_word){
            console.log("#####FOUND: "+actual_word);
            console.log("Find it in HTML and move it");

            // Clean up the detected word so it can be used for highlighting
            let mark_word = detected_word.replace("'","’").replace(",","");
            
            
            // $("#story").mark(actual_word,{accuracy:'exactly'});

            // Dec 1 switched
            // $("#story").mark(actual_word,options);

            // Problem here is the

            $("#story").mark(mark_word,options);
            
            audio.play();

            at_wrd+=1;
            if (!(timer_started)){
                countdown("ten-countdown", daily_objective, 0 );
            }
            

        }
        // If its in the homophone dictionary or the multi_word dictionary
        else if((stripped_word in homophone_dict) || in_multiword_dict){

            var multiword_caught = false;


            // Check multi word homophones like [aux hommes]
            if (in_multiword_dict){
                
                console.log('multiword');

                // Check next word  ex. if aux check if hommes is next (only works for 2 words)
                let whole_word = words[at_wrd].trim()+ ' '+ words[at_wrd+1].trim();

                // console.log("Whole word = "+whole_word);

                console.log(whole_word in homophone_multiword_dict);
                if (whole_word in homophone_multiword_dict){
                    console.log('multiword '+whole_word+'caught');

                    homophone_multiword_dict[whole_word].forEach(function (item, index) {
                        console.log('multiword checking: '+item);
                        if (detected_word==item){
                            multiword_caught = true;
                            console.log('Homophone (multiword) RESOLVED: '+item+' sounds like: '+whole_word);
                            $("#story").mark(words[at_wrd],options);
                            $("#story").mark(words[at_wrd+1],options);
                            audio.play();
                            at_wrd+=2;
                            if (!(timer_started)){
                                countdown("ten-countdown", daily_objective, 0 );
                            }
                            
                        }
                    })
                }

            }

            console.log('######################### This word has homophones: '+stripped_word);
            console.log('###### Homophone: going through: '+homophone_dict[stripped_word]);


            // If no multiword caught then do them in a single fashion
            if (multiword_caught == false){

                // Go through the homophone possible values dict = {'en':['on','un']}
                homophone_dict[stripped_word].forEach(function (item, index) {
                    if (detected_word.toLowerCase()==item.toLowerCase()){
                        console.log('-------------------------------\n');
                        console.log('Homophone RESOLVED: '+item+' sounds like: '+stripped_word);
                        console.log('-------------------------------');
                        $("#story").mark(actual_word,options);
                        audio.play();
                        at_wrd+=1;
                        if (!(timer_started)){
                            countdown("ten-countdown", daily_objective, 0 );
                        }
                        
                    }
                })
            }
            

        }
        
    })
    // If signed in
    if (token!=null){
        localStorage.setItem('words_completed',at_wrd);
        checkpoint_update(at_wrd);
    }
    
}

$(".annotate").hover(function(e){

    
    // Only take annotation classes such as 'annotation 1', 'annotation 2'... not 'annotation' (used for numbers)
    if(this.classList[1].includes('number')){
        let index = this.classList[1].replace('number','') -1;
        $($('.annotate')).attr('data-original-title',numbers[index]);
    }
    else{
        let annot_number = this.classList[1]-1;
        // $(".tooltiptext").text(annotated_meanings[annot_number]);
        // alert(annotated_meanings[annot_number]);
        $($('.annotate')).attr('data-original-title',annotated_meanings[annot_number]);
    }

})

// Show a small story title when the big title is scrolled past
$(".story_holder").scroll(function(e){
    if(this.scrollTop>=150){
        // $(".book-title-small").fadeOut(500);
        

        $(".book-title-small").animate({
            opacity:1
        })
    }
    else{
        // $(".book-title-small").fadeIn(500);
        
        $(".book-title-small").animate({
            opacity:0
        })

    }
})

function playAudio(url) {
    new Audio(url).play();
}

// Removed feb 8
// const words_complete = parseInt(localStorage.getItem('words_completed'));
// const skip_indices = JSON.parse(localStorage.getItem('skipped_words'));

// If there is word PROGRESS stored in localStorage





// If signed in
if (token!=null){

    const words_complete = parseInt(localStorage.getItem('words_completed'));
    const skip_indices = JSON.parse(localStorage.getItem('skipped_words')); 

    // GET PROGRESS FROM LOCAL STORAGE IF AVAILABLE
    if (words_complete != null && !isNaN(words_complete)){
        
        // Highlight the progress
        if (skip_indices==null || skip_indices==[]){
            highlight(words_complete,[]);
        }
        else{
            highlight(words_complete,skip_indices);
        }
    }
    // GET PROGRESS FROM DATABASE
    // else{

    //     // POST METHOD /getProgress lol
    // }
}


 function startTimer(){

    var objective = 10; // take this as param later

    // time started + objective time
    var time_end = new Date().getTime() + objective;

    var x = setInterval(function() {

        var time_now = new Date().getTime();


        // Find the distance between now and after objective
        var distance = time_now - time_end;
        // console.log(distance)
        
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        console.log(minutes+":"+seconds);
        
      
        // If the count down is finished, write some text
        if (distance < 0) {
        //   clearInterval(x);
        //   document.getElementById("demo").innerHTML = "EXPIRED";
        }
      }, 1000);
 }

 function countdown( elementName, minutes, seconds ){
    var element, endTime, hours, mins, msLeft, time;

    function twoDigits( n ){
        return (n <= 9 ? "0" + n : n);
    }

    function updateTimer(){
        msLeft = endTime - (+new Date);
        if ( msLeft < 1000 ) {
            // element.innerHTML = "Time is up!";
            $("#ten-countdown").css('color','#72c157');
            $("#ten-countdown").css('font-size','10px');
            $("#ten-countdown").html("Daily Objective <br> Complete!");
            $('.timer_holder').css('padding-left','26px');
            $('.timer').css('font-size','16px');
            $('.timer').css('text-align','center');
            $('.timer').css('display','flex');

            
            $('.timer_clock').hide();
            
        } else {
            time = new Date( msLeft );
            hours = time.getUTCHours();
            mins = time.getUTCMinutes();
            element.innerHTML = (hours ? hours + ':' + twoDigits( mins ) : mins) + ':' + twoDigits( time.getUTCSeconds() );
            setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
        }
    }

    element = document.getElementById( elementName );
    endTime = (+new Date) + 1000 * (60*minutes + seconds) + 500;
    updateTimer();
}


// countdown( "ten-countdown", 0.1, 0 );

