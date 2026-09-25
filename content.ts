/* ─────────────────────────────────────────────────────────────
   ♥  EDIT ME  ♥
   Everything personal on the site lives in this one file:
   names, the date, photos, the letter, little notes, songs.
   Change the text between the quotes and save — that's it.
   ───────────────────────────────────────────────────────────── */

export const content = {
  him: "abul ♥", 
  me: "diana",
  startDate: "2026-08-30T00:00",
  intro: {
    startTitle: "press start",
    startSub: "esp for {him}",
    windowTitle: "for_you.exe",
    lines: [
      "> hi {him}",
      "...",
      "> happy one month!",
      "> i made you this little site to celebrate",
      "...",
      "> are you ready?",
    ],
    yes: "yes",
    no: "no",
    noReplies: ["are you sure?", "wrong button", "try again", "nope :)", "just press yes"],
    envelopeHint: "click the envelope",
    stickyNote: "p.s. turn your\nsound on ♪",
  },

  diaryTitle: "month one",
  diaryDate: "aug — sept 2026",
  photos: [
    { src: "/photos/01.jpg", caption: "я в тебе нашла абсолютно все" },
    { src: "/photos/02.jpg", caption: "наше первое свидание" },
    { src: "/photos/03.jpg", caption: "неожиданная приятность<3" },
    { src: "/photos/04.jpg", caption: "теперь ты тоже часть нашего гэнга" },
    { src: "/photos/05.jpg", caption: "две обезьянки" },
    { src: "/photos/06.jpg", caption: "четыре обезьянки" },
  ],
  ticket: { top: "admit two", middle: "the start of us", bottom: "[30 · 08 · 2026]" },


  letter: {
    greeting: "dear {him},",
    left: [
      "во первых, хочу сказать тебе спасибо за то, что остаешься самим собой и открывешься с каждым днем по новому. i know it isnt easy to open up, and i don't take it for granted at all. i fall for you more and more each second, all this is because you are just amazing, and i will try to describe what i fell towards you.",
      "i am in love with your smile, your eyes, your voice, your soul, your intelligence, your humor, your dissing skills, your relationship with your family, and your lovely personality overall.",
      "and i am so so so grateful что ты не тормоз и что ты смог добиться чего хотел и сделал меня самой самой счастливой девушкой;)",
    ],
    right: [
      "я люблю то, как я чувствую себя рядом с тобой. ты приносишь мне чувство спокойствия, уверенности, доверия, радости. с тобой я хочу смеяться, плакать, мечтать, строить планы, творить, говорить всякую чушь и понимать что ты меня понимаешь:)",
      "я люблю то, как ты заботишься обо мне, как ты меня поддерживаешь, как ты меня вдохновляешь. и я надеюсь, что со мной ты чувствуешь себя в таком же тепле. я люблю то, что мы можем быть собой рядом друг с другом и что мы можем быть разными и при этом быть вместе.",
      "люблю тебя, wish for many more months and years together <3",
    ],
    signoff: "yours, ",
  },

  littleThings: {
    title: "little things i love about you",
    hint: "(tap to unfold)",
    notes: [
      "как ты после милостей делаешь руками пистолет",
      "что ты скидываешь мне стикер няшечка вкусняшечка",
      "как ты сайд айишь и отводишь взгяд и опять сайд айишь",
      "как ты в леттербоксе всем фильмам ставишь 5 звезд",
      "как ты невпопад читаешь позера и других рэперов ",
      "как ты быстро подстраиваешься под вайб и шутки, и дружишь с моими лпшками",
    ],
  },

  pressed: {
    tag: "[picked · 30.08.2026]",
  },

  
  music: {
    tapeTitle: "songs that are you",
    vinylCrackle: true, 
    songs: [
      {
        src: "/music/01.mp3",
        title: "Танцы",
        artist: "ssshhhiiittt!",
        note: "самый романтичный момент, незапланированный, уютный, natural. как ты тогда предложил потанцевать и признался в любви, я буду хранить этот момент всегда в памяти",
      },
      {
        src: "/music/02.mp3",
        title: "безнегативный дисс",
        artist: "абубигдик",
        note: "очень мимимимми, хочу переслушивать его часами. люблю как ты up for any weird thing и ловишь волну прикола;) этот дисс ужасно милый",
      },
      {
        src: "/music/03.mp3",
        title: "Give me everything",
        artist: "Afrojack, Ne-Yo, and Pitbull",
        note: "птичка нашептала про наши репетиции;)",
      },
      {
        src: "/music/04.mp3",
        title: "Undercover martyn",
        artist: "Two Door Cinema Club",
        note: "твоя песня, которая мне очень полюбилась. мне кажется, мелодия песни подходит твоему вайбу, и каждый раз когда я ее слышу, я представляю как ты едешь в шаг на велике",
      },
    ],
  },

  ending: "see you at month two",
};

export type Content = typeof content;
