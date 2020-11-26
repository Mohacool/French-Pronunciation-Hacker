// var sentence = "Hello how are you today i hope you are doing fine";
// var sentence = "Le 24 février 1815, en France, un grand bateau appelé « le Pharaon » entre dans le port de Marseille. Le bateau avance très lentement et avec une apparence vraiment triste. Alors, certaines personnes curieuses sur la plate-forme du port se demandent si un accident est arrivé.";
// $("#story").text(sentence);



$("#holdbutton").mousedown(function(){
    console.log('holding.....');
    $("#holdbutton").css({'background-color':'red'});
    startRecording();
})

$("#holdbutton").mouseup(function() {
    $("#holdbutton").css({'background-color':'blue'});
    console.log('released');
    stopRecording();
  });
  

// Initialize ScrollBar
const ps = new PerfectScrollbar('.result_holder', {
    wheelPropagation: false,
});

let transcript_length = my_transcript.length;
console.log(my_transcript);


var annotated_words=["bateau","se demandent","marin","Il a l’air calme","Crie","à bord","malheur","soulagé","la mer ","obéissent","inattendue","épée","survécu","voilà","le comptable","dextérité","saisit","laisse","surtout","des conseils","en jetant un regard","haine","l'île d'Elbe","au lieu de"];
var annotated_meanings = ["a boat","to ask oneself / to wonder","a sailor / a seaman ","il semble calme = he looks calm","to yell","on board","un problème = a misfortune","rassuré = relieved","the sea","obéir = to obey","unexpected","une épée = a sword","survived (verbe: survivre)","here is…","the accountant","agilité","to seize","laisser = to let / to give","above all","advices (masculin)","take a look","hatred / anger","l'île d'Elbe est fameuse pour être l'île d'exil de Napoléon en 1814-15","instead of"];

var numbers=["vingt-quatre","mille-huit-cent-quinze"];

var audio_words = ["monsieur","est-il","Naples","survécu","laisse","comptable","l’eau","semble","Immédiatement"];
var audio_files = ["monsieur.mp3","est-il.mp3","Naples.mp3","survécu.mp3","laisse.mp3","comptable.mp3","leau.mp3","semble.mp3","Immédiatement.mp3"];

$.ajax({
    url: "assets/chapter1.txt",
    dataType: "text",
    async: false,
    success: (content) => {


        let lines=content.split('\n');

        // var chapters = ["1 L’ARRIVÉE"];

        lines = lines.slice(1,); // Remove title

        

        // lines = lines.map( element => element.replace("",'<br>'));

        lines = lines.filter(e=> e.length!=1);

       

        lines = lines.map( element => element.replace("*",'&emsp;&emsp;'));
        lines = lines.map( element => element.replace("    ",'&emsp;&emsp;'));
        lines = lines.map(element => element+"<br><br>");

        // lines = lines.map(element => element.replace("«","<br>«"));
        $("#chapter_title").html("1 L’ARRIVÉE");


        console.log("linesblue------------------");
        console.log(lines);

       

        lines = lines.join(" ");
        console.log("I NEED TO GET HERE------------------");
        console.log(lines);



        // Go through every annotation in annotation_list and replace the annotations in the big string

        annotated_words.forEach(function (word, i) {

            // Gets the full annotation ex: sailor[1]
            let annot_number = i +1;
            let full_annotation = word+"["+annot_number+"]";
            console.log(full_annotation);

            // in the loop keep replacing blah[1],blah[2],blah[3]....
            lines = lines.replace(full_annotation,
                `<span class='annotate ${annot_number}' data-toggle="tooltip" data-placement="top" title="Tooltip on top">
                ${word}
                   
                    
                </span>`);
        })


        // Add number annotations manually (this can be made into a loop later)
        lines = lines.replace("24","<span class='annotate number1' data-toggle='tooltip' data-placement='top' title='vingt-quatre'>24</span>");
        lines = lines.replace("1815,","<span class='annotate number2' data-toggle='tooltip' data-placement='top' title='mille-huit-cent-quinze'>1815,</span>");

       // Add audio annotations manually (this can be made into a loop later)
       audio_words.forEach(function (audio_word, index){    
            lines = lines.replace(audio_word,`<span onclick="playAudio('assets/audio/${audio_files[index]}')" class='audio' data-toggle='tooltip' data-placement='top' title="<img src='assets/audio.png' height='30px'/>" >${audio_word}</span>`);

       })
    //    lines = lines.replace("monsieur",`<span onclick="playAudio('audio/monsieur.mp3')" class='audio audio1' data-toggle='tooltip' data-placement='top' title="<img src='audio.png' height='30px'/>" >monsieur</span>`);
    //    lines = lines.replace("est-il",`<span onclick="playAudio('audio/est-il.mp3')" class='audio audio1' data-toggle='tooltip' data-placement='top' title="<img src='audio.png' height='30px'/>" >est-il</span>`);


        

        $("#story").html(lines);
    }
    
    
})

var sentence = $("#story").text(); // Fetch the story from the html 
console.log(sentence);

var words = sentence.split(" ");
words = words.filter(word => word!="«" && word!="»").filter(e=> e!="" && e!="  ").filter(e=> e!="\n");




console.log("words->");
console.log(words);


var at_wrd = 0;
var dict = {};
$("#skipword").on('click',function(){
    // alert('at word '+words[at_wrd]+' and skipping');
    $("#story").mark(words[at_wrd],{
        accuracy:'exactly',
        className: "highlight"
});
    at_wrd +=1;

})
function canalyse(transcript){
    console.log('canalyse run');
    // Split up the words detected
    var words_detected = transcript.split(" ");

    // Clean it up
    words_detected = words_detected.filter(function(e){return e }); 

    words_detected.forEach(function (item, index) {
        var detected_word = item.toLowerCase();
        
        // Actual word that is in the HTML
        var actual_word = words[at_wrd];
        
        // Cleaned up word used for comparison
        var stripped_word = words[at_wrd].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()«»]/g,"").toLowerCase().trim();
        console.table("Detected: " + detected_word, "Stripped: ",stripped_word);
        if (detected_word==stripped_word){
            console.log("#####FOUND: "+actual_word);
            console.log("Find it in HTML and move it");
            var options = {
                "filter": function(node, term, totalCounter, counter){
                    console.log('count:'+counter);
                    console.log('term:'+term);
                    console.log('total:'+totalCounter);

                    console.log("The word: "+term+"has been found "+counter+"times");

                    if (!(term in dict)){
                        dict[term] = 0;
                    }
                    console.log(dict);

                    if(counter >= dict[term]){
                        console.log(term+" is >=1 so must be blocked");
                        dict[term]+=1;
                        return false;
                    } else {
                        console.log("true");
                        // counter+=1;
                        return true;
                    }
                },
                accuracy:'exactly'
                
            };
            
            $("#story").mark(actual_word,{accuracy:'exactly'});

            
            // $("#story").mark(actual_word,options);

            at_wrd+=1;

        }
        
    })
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



