// Static UDL content for Grade 5 - Science topics
export type TopicKey = "matter" | "motion" | "human-body";

export interface TopicContent {
  id: TopicKey;
  title: string;
  emoji: string;
  representation: {
    video: { url: string; title: string };
    diagram: { url: string; title: string };
    kinesthetic: { url: string; title: string };
    reading: { title: string; pdfUrl: string; notes: string[]; imageUrl?: string };
  };
  actions: {
    video: string;
    diagram: string;
    kinesthetic: string;
    reading: string;
  };
  challenge: {
    title: string;
    description: string;
  };
}

export const TOPICS: Record<TopicKey, TopicContent> = {
  matter: {
    id: "matter",
    title: "Matter & Materials",
    emoji: "🧪",
    representation: {
      video: { url: "https://youtu.be/UiyZIHK8tHg", title: "States of Matter for Kids" },
      diagram: { url: "/chemd.png", title: "Phase Change Diagram" },
      kinesthetic: { url: "https://youtu.be/i4DYIFaT3Ok", title: "Kinesthetic: Playing with Matter" },
      reading: {
        title: "Matter & Materials — Class Notes",
        pdfUrl: "https://drive.google.com/file/d/1vGn1TmWRdicQof96iKRmy3bnBTagGnA0/view?usp=sharing",
        notes: [
          "Matter is anything that has mass and takes up space.",
          "The three common states: solid, liquid, and gas.",
          "Particles in solids vibrate in fixed positions.",
          "Heating and cooling cause changes of state (melting, freezing, evaporation, condensation).",
        ],
        imageUrl: "/matterw.png",
      },
    },
    actions: {
      video: "Record a 60-sec video note explaining the 3 states of matter using examples from your kitchen.",
      diagram: "Draw a labeled diagram showing what happens to particles when ice melts and water boils.",
      kinesthetic: "Demonstrate one state of matter using your body and ask your family to guess which state it is.",
      reading: "Write a one-page diary entry as a water molecule going through all three states.",
    },
    challenge: {
      title: "Grade 6 Stretch: Plasma & Bose-Einstein Condensates",
      description: "Research the two 'extra' states of matter beyond solid/liquid/gas. Create a comic strip explaining where each one is found in the universe.",
    },
  },
  motion: {
    id: "motion",
    title: "Motion, Forces & Energy",
    emoji: "⚡",
    representation: {
      video: { url: "https://youtu.be/PHz1KYwPjJU", title: "Forces and Motion for Kids" },
      diagram: { url: "/phyd.png", title: "Newton's Cradle — Energy Transfer" },
      kinesthetic: { url: "https://youtu.be/Q-kccJsg96w", title: "Kinesthetic: Forces of Nature" },
      reading: {
        title: "Motion, Forces & Energy — Class Notes",
        pdfUrl: "https://drive.google.com/file/d/1vEcUzxv3fcZ3aILD4EGk8NVo18r5i7k5/view?usp=sharing",
        notes: [
          "A force is a push or a pull.",
          "Friction slows things down; gravity pulls them toward Earth.",
          "Energy can be kinetic (moving) or potential (stored).",
          "Newton's Third Law: every action has an equal and opposite reaction.",
        ],
        imageUrl: "/motionw.png",
      },
    },
    actions: {
      video: "Record a video explaining one example of friction, gravity, and applied force from your home.",
      diagram: "Draw arrows on a picture of a soccer kick to show all forces acting on the ball.",
      kinesthetic: "Build a balloon rocket and measure how far it travels with 1, 2, and 3 puffs.",
      reading: "Write a short story called 'A Day Without Gravity' (~150 words).",
    },
    challenge: {
      title: "Grade 6 Stretch: Calculate Speed",
      description: "Time a toy car rolling down a 1-meter ramp at three different angles. Calculate speed (distance ÷ time) for each. Which angle wins?",
    },
  },
  "human-body": {
    id: "human-body",
    title: "Human Body",
    emoji: "🫀",
    representation: {
      video: { url: "https://youtu.be/LReJG7PrXFY", title: "Human Body Systems for Kids" },
      diagram: { url: "/biod.png", title: "Human Body Diagram" },
      kinesthetic: { url: "https://youtu.be/7bGQOMlQo7w", title: "Kinesthetic: Heart Rate Experiment" },
      reading: {
        title: "Human Body — Class Notes",
        pdfUrl: "https://drive.google.com/file/d/10TJDSEUh_5LpU986p-g-4e52VhMtGtXA/view?usp=sharing",
        notes: [
          "The body has 11 organ systems working together.",
          "The heart pumps blood through arteries and veins.",
          "Lungs exchange oxygen and carbon dioxide.",
          "The brain controls everything via the nervous system.",
        ],
        imageUrl: "/humanw.png",
      },
    },
    actions: {
      video: "Record yourself naming and locating 5 organs on your own body.",
      diagram: "Draw and label a diagram of the digestive system from mouth to small intestine.",
      kinesthetic: "Build a balloon-and-bottle lung model and demonstrate breathing to a family member.",
      reading: "Write a thank-you note to one organ in your body explaining why you need it.",
    },
    challenge: {
      title: "Grade 6 Stretch: Track Your Pulse",
      description: "Measure your resting pulse, then after 1 minute of jumping jacks. Plot the change on a bar chart and explain what your heart is doing.",
    },
  },
};

// Hardcoded Cognitivism content (one entry per topic)
export const COGNITIVISM_CONTENT: Record<TopicKey, { steps: string[]; tips: string[]; acronyms?: string[] }> = {
  matter: {
    steps: [
      "Activate prior knowledge: ask students to name things they touched/drank today and sort by solid/liquid/gas.",
      "Chunk content: introduce ONE state at a time, never all three at once.",
      "Use dual coding: pair each definition with a simple particle-arrangement diagram.",
      "Worked example: demonstrate ice→water→steam with clear narration.",
      "Practice retrieval: 1-minute quick-fire questions at the end.",
    ],
    tips: [
      "Limit new vocabulary to 4 words per lesson (matter, mass, particle, state).",
      "Use physical gestures to represent particle motion — students 'become' the particles.",
      "Avoid overloading slides with text; one image + one sentence works best.",
      "Connect every abstract state to a single familiar object (like a water bottle) so students don't waste mental energy learning new contexts while trying to understand particle behavior.",
    ],
    acronyms: [
      "S.S.S - Solids Stay Shaped",
      "P.A.V.E. - Particles Are Very Energetic",
      "F.L.O - Flows Like Ocean",
      "G.A.S - Goes Anywhere Swiftly",
    ],
  },
  motion: {
    steps: [
      "Anchor in everyday experience: 'When you push a door, what happens?'",
      "Build schema gradually: push/pull → friction → gravity → energy.",
      "Use analogies students already know (bicycle brakes for friction).",
      "Model the thinking: think aloud while predicting how a ball will roll.",
      "Spaced recall: revisit yesterday's concept for 2 min before introducing new content.",
    ],
    tips: [
      "Pre-teach the 3 force vocabulary words on Day 1 with simple actions.",
      "Use color-coded arrows in diagrams (red = push, blue = pull) consistently across lessons.",
      "Break experiments into 3 small steps with a check-in between each.",
      "When explaining how forces interact on an object, avoid showing every force (gravity, friction, air resistance, applied push) all at once.",
    ],
    acronyms: [
      "F.A.S.T - Friction Acts Slowing Things",
      "M.O.V.E - Motion Occurs Via Energy",
      "D.R.A.G - Direct Resistance Against Going",
      "I.D.L.E - Inertia Doesn't Like Effort",
    ],
  },
  "human-body": {
    steps: [
      "Start with the familiar: 'Place your hand on your chest. What do you feel?'",
      "Use a body-map handout students label as you teach — one system per session.",
      "Connect new info to existing schema (heart = pump, like a water pump).",
      "Provide a graphic organizer: organ → job → connected organs.",
      "End with a 30-second 'teach your neighbor' to consolidate memory.",
    ],
    tips: [
      "Limit to 1 system per 30-min lesson. Deep > broad.",
      "Use real X-rays, MRIs, or stethoscopes — concrete examples reduce cognitive load.",
      "Provide a printed glossary; don't make students copy definitions while listening.",
      "Teach what a system does before forcing the memorization of what the parts are called.",
    ],
    acronyms: [
      "B.L.U.E - Bones Link Up Everywhere",
      "S.K.I.N - Shields Keeping Insides Neat",
      "C.E.L.L - Creating Every Living Layer",
      "B.R.A.I.N - Boss Running All Internal Networks",
    ],
  },
};

// Hardcoded Constructivism content
export const CONSTRUCTIVISM_CONTENT: Record<TopicKey, { questions: string[]; realLife: string; task: string; scaffolds: string[] }> = {
  matter: {
    questions: [
      "Why do you think a puddle disappears on a sunny day?",
      "Can the same 'thing' be a solid, a liquid, AND a gas? Give an example.",
      "What would happen if there were no gases in our atmosphere?",
    ],
    realLife: "Cooking is matter changing states constantly: butter melts (solid→liquid), water boils (liquid→gas), ice cream freezes. Have students keep a 'kitchen science' journal for one week.",
    task: "Group challenge: design a 'matter detective' poster identifying 10 items in the classroom and classifying them by state — including tricky ones (toothpaste, smoke, jelly).",
    scaffolds: [
      "Sentence starter: 'I think this is a __ because the particles are __.'",
      "Provide a sorting mat with labeled columns for groups that need structure.",
      "Pair stronger and developing students for mixed-ability discovery.",
    ],
  },
  motion: {
    questions: [
      "Why is it harder to push a heavy box than a light one?",
      "What slows down a rolling ball — is there more than one force?",
      "How would sports change if Earth's gravity were half as strong?",
    ],
    realLife: "Skateboards, swings, sliding doors, and bicycles all use the same physics. Ask students to find 3 examples of friction in their playground and rate them from 'most useful' to 'most annoying.'",
    task: "Build challenge: in groups, design and test a ramp that makes a marble travel exactly 2 meters. Adjust angle, surface, and starting height. Reflect on what they changed and why.",
    scaffolds: [
      "Provide a prediction-observation-explanation worksheet.",
      "Offer 'force vocabulary' cards students can point to during discussion.",
      "Demonstrate one full trial yourself before groups begin.",
    ],
  },
  "human-body": {
    questions: [
      "Why do you breathe faster when you run?",
      "What jobs does your body do automatically — without you thinking?",
      "How are the heart and lungs like teammates?",
    ],
    realLife: "Doctors, nurses, athletes, and chefs all use body knowledge daily. Invite a student to share what they noticed at their last check-up, or watch a short clip of a cardiologist.",
    task: "Body system poster project: groups pick one system, build a poster with diagram + 3 'fun facts' + one real-world job that depends on understanding that system.",
    scaffolds: [
      "Provide a partially-filled organ outline to label.",
      "Give a 'job-of-the-organ' word bank for emerging readers.",
      "Allow oral or video presentations as alternatives to written posters.",
    ],
  },
};

// Hardcoded Developmental Advisor content
export type GradeBand = "lower-primary" | "upper-primary" | "middle-school" | "high-school";

export const GRADE_BANDS: { id: GradeBand; label: string; range: string }[] = [
  { id: "lower-primary", label: "Lower Primary", range: "Grades 1–3" },
  { id: "upper-primary", label: "Upper Primary", range: "Grades 4–6" },
  { id: "middle-school", label: "Middle School", range: "Grades 7–8" },
  { id: "high-school", label: "High School", range: "Grades 9–10" },
];

export const DEV_TIPS: Record<GradeBand, Record<TopicKey, { piaget: string; vygotsky: string; erikson: string; smartTips: string[] }>> = {
  "lower-primary": {
    matter: {
      piaget: "Preoperational → Concrete operational. Use real objects (ice cubes, water, balloons) — children think in tangibles, not abstractions.",
      vygotsky: "Pair students for guided exploration. Your scaffolding voice ('What do you notice?') is the most powerful teaching tool here.",
      erikson: "Industry vs. Inferiority. Celebrate every 'I made it work!' moment — competence at this stage builds lifelong confidence.",
      smartTips: [
        "Use sensory tubs with sand, water, and ice for direct exploration.",
        "Sing a 'states of matter' song with hand motions.",
        "Avoid vocabulary like 'molecules' — say 'tiny pieces' instead.",
      ],
    },
    motion: {
      piaget: "Children grasp cause-and-effect through play. Ramps, balls, and toy cars beat any worksheet.",
      vygotsky: "Talk-aloud modeling: narrate what you do as you push, pull, or roll an object.",
      erikson: "Give every child a turn to lead an experiment — autonomy fuels engagement.",
      smartTips: [
        "Use ramps, marbles, and toy cars freely.",
        "Ask 'what will happen if…?' before every demo.",
        "Keep lessons under 20 minutes — attention spans are short.",
      ],
    },
    "human-body": {
      piaget: "Concrete and self-referential — start every lesson with 'find this on YOUR body.'",
      vygotsky: "Use a body-tracing on butcher paper as a shared scaffold the whole class builds together.",
      erikson: "Encourage 'I can take care of my body' habits (handwashing, brushing) — links learning to identity.",
      smartTips: [
        "Use a stuffed animal 'patient' to teach organ names playfully.",
        "Read picture books like 'Me and My Amazing Body.'",
        "Avoid graphic medical imagery at this age.",
      ],
    },
  },
  "upper-primary": {
    matter: {
      piaget: "Concrete operational. Students can classify and reason about reversible changes — perfect for melting/freezing experiments.",
      vygotsky: "Group work in the Zone of Proximal Development. Mix abilities deliberately.",
      erikson: "Industry vs. Inferiority peaks here. Hands-on success builds lasting self-belief.",
      smartTips: [
        "Run controlled experiments with measurement (thermometers, scales).",
        "Introduce 'particles' as small dots in diagrams — visual schema.",
        "Use group lab roles (recorder, investigator, reporter).",
      ],
    },
    motion: {
      piaget: "Beginning to handle simple variables. Predict-test-revise cycles are gold.",
      vygotsky: "Peer dialogue is critical — let students argue about what causes the ramp result before you explain.",
      erikson: "Public success matters. Display projects in the hallway.",
      smartTips: [
        "Use simple data tables for trial results.",
        "Connect to playground physics they already know.",
        "Introduce vocabulary AFTER the experience, not before.",
      ],
    },
    "human-body": {
      piaget: "Can understand systems and interconnections. Body-as-machine analogy works well.",
      vygotsky: "Jigsaw activities: each group masters one system, teaches another.",
      erikson: "Personal health choices start to matter — link learning to real life.",
      smartTips: [
        "Use 3D models or apps for organ exploration.",
        "Track real data: heart rate before/after exercise.",
        "Invite a guest (school nurse, parent doctor).",
      ],
    },
  },
  "middle-school": {
    matter: {
      piaget: "Transitioning to formal operational. Can handle abstract particle theory and chemical change.",
      vygotsky: "Move scaffolding from teacher → peer → independent. Begin handing over responsibility.",
      erikson: "Identity vs. Role Confusion. Let students 'be' the scientist with lab notebooks.",
      smartTips: [
        "Introduce molecular models and basic atomic structure.",
        "Use real lab equipment with safety procedures.",
        "Discuss careers in materials science, chemistry.",
      ],
    },
    motion: {
      piaget: "Can manipulate variables systematically. Introduce controlled experiments with one variable.",
      vygotsky: "Socratic questioning > lecturing. Push students to defend their reasoning.",
      erikson: "Connect physics to identity-relevant interests (sports, gaming, music).",
      smartTips: [
        "Use stopwatches and rulers for real measurement.",
        "Introduce simple equations (speed = distance/time).",
        "Debate questions: 'Is gravity stronger on the moon?'",
      ],
    },
    "human-body": {
      piaget: "Ready for cellular and systemic thinking — cells → tissues → organs → systems.",
      vygotsky: "Collaborative concept mapping reveals shared and individual understanding.",
      erikson: "Puberty content lands here — be honest, accurate, and respectful of identity exploration.",
      smartTips: [
        "Use case studies: 'What happens during a heart attack?'",
        "Introduce homeostasis and feedback loops.",
        "Address health, nutrition, and mental wellness explicitly.",
      ],
    },
  },
  "high-school": {
    matter: {
      piaget: "Formal operational. Can reason hypothetically about atoms, bonds, and chemical reactions.",
      vygotsky: "Independent inquiry projects with teacher as consultant, not lecturer.",
      erikson: "Identity formation continues — let students choose project directions.",
      smartTips: [
        "Use the periodic table actively — predict reactions.",
        "Bring in real chemistry labs with hypothesis testing.",
        "Connect to climate science and sustainability.",
      ],
    },
    motion: {
      piaget: "Full formal reasoning. Algebra-based physics is appropriate.",
      vygotsky: "Use expert-novice pairings; advanced students mentor others.",
      erikson: "Future-orientation: link physics to college and careers.",
      smartTips: [
        "Introduce vector diagrams and Newton's laws formally.",
        "Use simulations (PhET) for variables impossible in class.",
        "Discuss real engineering applications.",
      ],
    },
    "human-body": {
      piaget: "Can integrate biochemistry, anatomy, and systems-level reasoning.",
      vygotsky: "Cooperative dissections, peer-led seminars.",
      erikson: "Address mental health, sexuality, and autonomy with maturity and respect.",
      smartTips: [
        "Use real medical case studies and ethics discussions.",
        "Discuss careers in medicine, research, public health.",
        "Allow student-led inquiry into a body system of choice.",
      ],
    },
  },
};

export const CHALLENGE_TAGS = [
  "Reading comprehension",
  "Math fluency",
  "Focus / attention",
  "Writing",
  "Memory recall",
  "Following instructions",
  "Social skills",
  "Emotional regulation",
  "Organization",
  "Verbal expression",
];
