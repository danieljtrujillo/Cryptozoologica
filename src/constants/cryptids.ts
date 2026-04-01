export interface CryptidEntry {
  id: string;
  name: string;
  scientificName: string;
  location: string;
  description: string;
  journalEntry: string;
  redactedResearcher: string;
  style: 'typewriter' | 'handwritten' | 'newspaper' | 'scanned' | 'copy';
}

export const PREFILLED_CRYPTIDS: CryptidEntry[] = [
  {
    id: 'chupacabra',
    name: 'Chupacabra',
    scientificName: 'Capra-sanguisugus arecibo',
    location: 'Florida, Puerto Rico (Near Arecibo)',
    description: 'A bipedal, reptilian creature with glowing red eyes and quills along its spine.',
    style: 'typewriter',
    journalEntry: `
      **Expedition Log #42 - Redacted Date**
      
      We arrived in the municipality of **Florida, Puerto Rico**, just south of Arecibo. The locals are terrified. Livestock losses are mounting. [REDACTED] and I found a carcass this morning—completely drained of blood. Two puncture wounds in the neck, perfectly circular, roughly 1.5 cm in diameter. The precision is surgical, yet the surrounding tissue shows signs of massive cellular trauma, as if the blood was drawn out under extreme pressure.
      
      The creature is unlike anything in the standard biological record. It stands roughly 3-4 feet tall. Its skin is leathery, almost scaly, with a greenish-gray hue that seems to shift slightly in different lighting conditions—a form of active camouflage? Most striking are the quills—they seem to vibrate when the creature is agitated, producing a low-frequency hum that [REDACTED] claims causes intense nausea.
      
      [REDACTED] believes it may be an escapee from the nearby [REDACTED] facility, but the biological complexity suggests a natural, albeit hidden, evolution. We tracked it to the limestone caves near the Río Encantado. The air there was thick with the smell of sulfur and ozone. We found a nesting site littered with the bones of small mammals, all showing the same peculiar puncture marks. The creature is clearly a specialized predator, possibly nocturnal, with a metabolism that requires high-energy biological fluids.
      
      *Signed,*
      *Researcher [REDACTED]*
    `,
    redactedResearcher: 'Dr. [REDACTED]'
  },
  {
    id: 'garadiabolo',
    name: 'Gara del Diablo',
    scientificName: 'Diabolus-ungula arecibo',
    location: 'Arecibo Observatory Perimeter, PR',
    description: 'A massive, clawed entity seen near the radio telescope dishes.',
    style: 'scanned',
    journalEntry: `
      **Observation Note - [REDACTED]**
      
      The night shift at the **Arecibo Observatory** reported strange interference on the 1420 MHz line—the very frequency associated with the search for extraterrestrial intelligence. When [REDACTED] went to check the sub-reflector, he saw it. A massive shadow, easily 8 feet across, perched on the tension cables.
      
      It has what appear to be three-toed claws, each nearly a foot long, tipped with a substance that looks like obsidian but feels like cold iron. The "Gara del Diablo" (Devil's Claw) as the locals call it. It didn't move when the spotlight hit it. It just... watched. Its eyes reflected the light with a violet shimmer, suggesting a highly specialized tapetum lucidum capable of seeing into the ultraviolet spectrum.
      
      We found deep gouges in the aluminum panels of the dish. The metal was peeled back like paper, and there were traces of a viscous, bioluminescent fluid left behind. [REDACTED] is convinced it's attracted to the high-frequency emissions of the observatory, perhaps even feeding on the electromagnetic energy. The creature's presence coincides with several "ghost signals" we've been receiving from the [REDACTED] sector.
      
      *Signed,*
      *Field Agent [REDACTED]*
    `,
    redactedResearcher: 'Agent [REDACTED]'
  },
  {
    id: 'moca-vampire',
    name: 'Vampire of Moca',
    scientificName: 'Vampyrus-mocaensis',
    location: 'Moca/Florida Border, Puerto Rico',
    description: 'A winged, bat-like humanoid with a massive wingspan.',
    style: 'handwritten',
    journalEntry: `
      **Incident Report #88 - [REDACTED]**
      
      The sightings started in Moca but have shifted toward the **Florida** karst region. Witnesses describe a "man-bat" with a face like a gargoyle and eyes that burn like hot coals. [REDACTED] interviewed a farmer who claims the creature lifted a small calf into the air with total ease, disappearing into the low-hanging clouds.
      
      I recovered a single tuft of fur from a barbed-wire fence near the [REDACTED] farm. It's coarse, black, and carries a faint electrostatic charge that made my skin crawl. Under the microscope, the follicles show a structure more similar to avian down than mammalian fur, but with a strange, metallic core. 
      
      The wingspan is estimated at 12-15 feet. It moves with total silence, even when flapping its massive wings. [REDACTED] suggests it might be using a form of active noise cancellation through its wing structure, possibly manipulating the air molecules themselves. We are setting up ultrasonic triggers near the cave entrances of the Camuy River system. The creature seems to be highly territorial and has been seen chasing away [REDACTED] drones.
      
      *Signed,*
      *Senior Biologist [REDACTED]*
    `,
    redactedResearcher: 'Prof. [REDACTED]'
  },
  {
    id: 'mothman',
    name: 'Mothman',
    scientificName: 'Lepidoptera-humanoidus',
    location: 'Point Pleasant, WV / Silver Bridge Area',
    description: 'A 7-foot tall winged humanoid with glowing red eyes.',
    style: 'newspaper',
    journalEntry: `
      **Archive Entry #1967 - [REDACTED]**
      
      The Point Pleasant sightings have reached a fever pitch. Witnesses describe a creature that is "man-like" but with wings that fold against its back. The most consistent detail is the eyes—large, glowing red, and set low in the chest or neck area. [REDACTED] claims the eyes have a hypnotic effect, inducing a state of paralyzed fear in anyone who looks directly at them.
      
      The creature was first spotted near the "TNT Area," a former World War II explosives manufacturing facility. The soil there is contaminated with [REDACTED], which some believe may have triggered a mutation in the local wildlife. However, the creature's appearance seems to coincide with strange aerial phenomena and reports of "Men in Black" visiting witnesses.
      
      The flight pattern is erratic, often described as a vertical takeoff followed by high-speed gliding. [REDACTED] analyzed a footprint found near the McClintic Wildlife Management Area; it shows a heavy, three-toed structure with significant weight distribution. The creature seems to be a harbinger of disaster, with sightings peaking just before the [REDACTED] event.
      
      *Signed,*
      *Investigator [REDACTED]*
    `,
    redactedResearcher: 'Agent [REDACTED]'
  },
  {
    id: 'bigfoot',
    name: 'Bigfoot',
    scientificName: 'Gigantopithecus-canadensis',
    location: 'Pacific Northwest, USA / British Columbia, Canada',
    description: 'A large, hairy, bipedal hominid.',
    style: 'copy',
    journalEntry: `
      **Field Report #742 - [REDACTED]**
      
      We spent three weeks in the Gifford Pinchot National Forest. The vocalizations we recorded are unlike any known primate—a deep, guttural "whoop" followed by a series of wood-knocks that seem to be a form of long-distance communication. [REDACTED] found several tree-structures that appear to be deliberate markers or shelters.
      
      The tracks we recovered are 16 inches long and 7 inches wide. The dermal ridges are clearly visible in the cast, ruling out a hoax. The mid-tarsal break—a feature absent in modern humans but present in some ancient hominids—is prominent. This creature is heavy, likely exceeding 800 pounds, yet it moves through the dense underbrush with incredible stealth.
      
      [REDACTED] recovered a hair sample from a cedar branch. DNA analysis was inconclusive, showing a mix of human-like sequences and [REDACTED] markers that don't match any known species. The creature seems to possess a high degree of intelligence and may even be using infrasound to disorient its prey or human observers.
      
      *Signed,*
      *Crypto-Primatologist [REDACTED]*
    `,
    redactedResearcher: 'Dr. [REDACTED]'
  },
  {
    id: 'nessie',
    name: 'Loch Ness Monster',
    scientificName: 'Plesiosaurus-scoticus',
    location: 'Loch Ness, Scotland',
    description: 'A long-necked aquatic creature inhabiting a deep freshwater loch.',
    style: 'scanned',
    journalEntry: `
      **Sonar Log - [REDACTED]**
      
      The deep-scan sonar at Urquhart Bay picked up a large, moving mass at a depth of 180 meters. The object is roughly 15-20 meters long and appears to have four large flippers. [REDACTED] noted that the movement pattern is consistent with a large marine reptile, not a fish or a seal.
      
      The loch is incredibly deep and contains a vast network of underwater caverns. [REDACTED] believes the creature may be using these caves to hide from surface observation. We deployed a remote-operated vehicle (ROV) but visibility was near zero due to the high peat content in the water. However, the ROV's camera captured a brief glimpse of a long, tapered neck moving through the darkness.
      
      Environmental DNA (eDNA) samples taken from the water show traces of an unknown vertebrate. While some suggest it's a giant eel, the skeletal structure suggested by the sonar returns points toward a relict population of [REDACTED]. The creature seems to be highly sensitive to engine noise and disappears as soon as research vessels approach.
      
      *Signed,*
      *Marine Biologist [REDACTED]*
    `,
    redactedResearcher: 'Prof. [REDACTED]'
  },
  {
    id: 'jersey-devil',
    name: 'Jersey Devil',
    scientificName: 'Diabolus-pinealensis',
    location: 'Pine Barrens, New Jersey',
    description: 'A kangaroo-like creature with a horse-like head, bat wings, and a forked tail.',
    style: 'newspaper',
    journalEntry: `
      **Historical Archive - [REDACTED]**
      
      The Pine Barrens are a vast, desolate stretch of forest that has long been the site of strange occurrences. The "Leeds Devil," as it was originally known, is said to be the 13th child of a local woman who cursed it at birth. [REDACTED] found several accounts from the early 1900s describing a creature that screams like a banshee and leaves cloven hoofprints on rooftops.
      
      The creature's anatomy is a bizarre patchwork: a horse's head, a deer's body, bat-like wings, and a long, thin tail. [REDACTED] suggests it may be a rare, nocturnal marsupial that has survived in the deep swamps of the Barrens. However, the reports of it breathing fire and having glowing eyes suggest a more supernatural origin.
      
      We found a series of strange markings on a group of pitch pines near the Mullica River. The bark was scorched, and there was a high concentration of [REDACTED] in the soil. The creature seems to be active during the winter months, with sightings peaking during heavy snowstorms.
      
      *Signed,*
      *Folklorist [REDACTED]*
    `,
    redactedResearcher: 'Researcher [REDACTED]'
  },
  {
    id: 'wendigo',
    name: 'Wendigo',
    scientificName: 'Spiritus-famelicus',
    location: 'Great Lakes Region / Northern Forests',
    description: 'A gaunt, skeletal humanoid associated with cannibalism and insatiable hunger.',
    style: 'typewriter',
    journalEntry: `
      **Incident Log #13 - [REDACTED]**
      
      The winter of [REDACTED] was particularly harsh. We were called to a remote logging camp in northern Minnesota. The men were gone, leaving behind only blood-stained snow and signs of a violent struggle. [REDACTED] found a set of tracks that started as human but gradually elongated into something monstrous.
      
      The Wendigo is not just a creature; it's a transformation. It is said to be born from the act of cannibalism, a spirit of greed and hunger that possesses the soul. The physical form is described as skeletal, with skin pulled tight over bone, and eyes that recede deep into the skull. [REDACTED] noted that the temperature dropped by 20 degrees whenever the creature was near.
      
      We heard the "Wendigo call"—a sound that mimics a human voice crying for help, but with an underlying hiss that chills the blood. The creature is incredibly fast and can move through the treetops with ease. [REDACTED] believes it is a manifestation of [REDACTED] energy, fueled by the desperation of the wilderness.
      
      *Signed,*
      *Anthropologist [REDACTED]*
    `,
    redactedResearcher: 'Dr. [REDACTED]'
  },
  {
    id: 'skinwalker',
    name: 'Skinwalker',
    scientificName: 'Mutator-navajoensis',
    location: 'Four Corners Region, USA / Navajo Nation',
    description: 'A harmful witch with the ability to transform into, or disguise themselves as, an animal.',
    style: 'handwritten',
    journalEntry: `
      **Classified Briefing - [REDACTED]**
      
      The "Yee Naaldlooshii" is a subject of intense taboo among the Navajo people. It is a practitioner of the "Witchery Way" who has achieved the highest level of dark power. [REDACTED] interviewed a witness who claims to have been chased by a wolf that stood on its hind legs and had human eyes.
      
      The transformation is said to require the wearing of an animal skin, usually a coyote, wolf, or bear. However, the Skinwalker can also take the form of a bird or even a ball of light. [REDACTED] noted that the creature's movements are "wrong"—too fast, too fluid, and often accompanied by a sound like dry leaves rattling.
      
      We investigated a series of livestock mutilations near the [REDACTED] ranch. The animals were killed with precision, but no meat was taken. Instead, strange symbols were carved into the hides. [REDACTED] believes the Skinwalkers are using the ranch as a site for [REDACTED] rituals. The locals refuse to speak about it, fearing that even mentioning the name will draw the creature's attention.
      
      *Signed,*
      *Special Agent [REDACTED]*
    `,
    redactedResearcher: 'Agent [REDACTED]'
  },
  {
    id: 'flatwoods-monster',
    name: 'Flatwoods Monster',
    scientificName: 'Extraterris-braxtonensis',
    location: 'Flatwoods, WV',
    description: 'A 10-foot tall entity with a spade-shaped head and a metallic body.',
    style: 'newspaper',
    journalEntry: `
      **Incident Report #1952 - [REDACTED]**
      
      The event began with a bright object crossing the sky and landing on a hillside near Flatwoods. A group of local boys and a woman went to investigate. They encountered a creature that stood 10 feet tall, with a glowing red face and a dark, spade-shaped cowl. [REDACTED] interviewed the witnesses, who all described a "hissing" sound and a pungent, metallic mist that made them violently ill.
      
      The creature's body appeared to be made of a dark, metallic substance, possibly a suit or a craft. It moved by gliding, as if on a cushion of air. [REDACTED] found a circular area of flattened grass at the site, with high levels of radiation and a strange, oily residue.
      
      The "Braxton County Monster" is often associated with the [REDACTED] phenomenon. The physical symptoms experienced by the witnesses—nausea, throat swelling, and convulsions—suggest exposure to a chemical or biological agent. [REDACTED] believes the creature was a pilot of the downed craft, attempting to [REDACTED] before it was recovered by military forces.
      
      *Signed,*
      *Air Force Investigator [REDACTED]*
    `,
    redactedResearcher: 'Major [REDACTED]'
  },
  {
    id: 'fresno-nightcrawler',
    name: 'Fresno Nightcrawler',
    scientificName: 'Crus-ambulator',
    location: 'Fresno, California / Yosemite National Park',
    description: 'A small, white, bipedal creature consisting mostly of legs.',
    style: 'copy',
    journalEntry: `
      **Surveillance Log - [REDACTED]**
      
      The security footage from a private residence in Fresno shows two white, spindly figures walking across the lawn. They appear to be nothing more than a pair of long legs connected to a small head or torso. [REDACTED] analyzed the footage and confirmed that it has not been tampered with. The movement is fluid, almost like a puppet, but with no visible wires or support.
      
      Similar creatures have been reported in Yosemite National Park. Local Native American legends speak of "swamp people" who are tall, thin, and walk with a strange, stilted gait. [REDACTED] suggests they may be a form of [REDACTED] life that has adapted to a low-gravity environment, or perhaps a non-biological entity.
      
      We attempted to track the creatures using thermal imaging, but they appear to be "cold"—showing no heat signature against the background. This suggests they may be composed of a material that does not emit infrared radiation, or that they are [REDACTED] in nature.
      
      *Signed,*
      *Anomalous Phenomena Analyst [REDACTED]*
    `,
    redactedResearcher: 'Analyst [REDACTED]'
  },
  {
    id: 'thunderbird',
    name: 'Thunderbird',
    scientificName: 'Gigantornis-fulminis',
    location: 'North America / Great Plains',
    description: 'A massive bird with a wingspan of over 20 feet, capable of creating thunder with its wings.',
    style: 'scanned',
    journalEntry: `
      **Aviation Report - [REDACTED]**
      
      A private pilot flying over the Badlands reported a "near-miss" with a bird that he estimated had a wingspan of 25 feet. He described it as having dark, iridescent feathers and a beak like a raptor. [REDACTED] checked the radar logs and found a large, slow-moving target at 5,000 feet that disappeared shortly after the sighting.
      
      The Thunderbird is a central figure in many Indigenous cultures, said to bring the rain and the storm. [REDACTED] found several petroglyphs in the Southwest that depict a giant bird with lightning bolts coming from its eyes. Some believe it is a surviving population of Teratorns, giant birds that went extinct at the end of the last Ice Age.
      
      We recovered a feather from a remote ridge in the Black Hills. It is nearly 4 feet long and has a structure that is incredibly strong yet lightweight. [REDACTED] noted that the feather carries a high static charge, which may explain the association with thunder and lightning. The creature seems to follow [REDACTED] weather patterns, appearing just before major storm fronts.
      
      *Signed,*
      *Ornithologist [REDACTED]*
    `,
    redactedResearcher: 'Dr. [REDACTED]'
  },
  {
    id: 'loveland-frog',
    name: 'Loveland Frog',
    scientificName: 'Ranidae-sapiens',
    location: 'Loveland, Ohio',
    description: 'A 4-foot tall frog-like humanoid.',
    style: 'typewriter',
    journalEntry: `
      **Police Report - [REDACTED]**
      
      Officer [REDACTED] was patrolling Riverside Drive when he spotted what he thought was a dog on the side of the road. As he slowed down, the creature stood up on its hind legs. It was roughly 4 feet tall, with leathery skin and a face that resembled a frog or lizard. It looked at the officer for a moment before jumping over the guardrail and into the Little Miami River.
      
      A second sighting occurred two weeks later by another officer. He described the creature as having a "wand" or "stick" that emitted sparks. [REDACTED] suggests this may have been a tool or a form of bioluminescence. The creature's skin was described as being "slimy" and "greenish-brown."
      
      We investigated the riverbank and found a series of webbed footprints in the mud. The tracks were roughly 8 inches wide and showed significant pressure, suggesting a heavy build. [REDACTED] believes the Loveland Frog may be a highly evolved amphibian or a [REDACTED] that has taken refuge in the river system.
      
      *Signed,*
      *Sergeant [REDACTED]*
    `,
    redactedResearcher: 'Officer [REDACTED]'
  },
  {
    id: 'beast-of-bray-road',
    name: 'Beast of Bray Road',
    scientificName: 'Canis-lupus-anthropus',
    location: 'Elkhorn, Wisconsin',
    description: 'A werewolf-like creature seen on a rural road.',
    style: 'handwritten',
    journalEntry: `
      **Field Notes - [REDACTED]**
      
      The sightings on Bray Road have been consistent since the late 80s. Witnesses describe a large, wolf-like creature that walks on its hind legs. It is said to be roughly 6-7 feet tall, with thick, dark fur and glowing yellow eyes. [REDACTED] interviewed a woman who claims the creature was kneeling in the road, eating a roadkill deer.
      
      Unlike traditional werewolf legends, there is no evidence of a human transformation. The "Beast" seems to be a permanent biological entity. [REDACTED] noted that the creature's anatomy is a mix of canine and primate, with powerful shoulders and hands capable of grasping objects.
      
      We found a series of claw marks on a barn door near the intersection of Bray Road and Highway 11. The gouges were deep and spaced roughly 4 inches apart. [REDACTED] believes the creature is highly territorial and may be part of a small, relict population of [REDACTED] that has survived in the agricultural heartland.
      
      *Signed,*
      *Cryptozoologist [REDACTED]*
    `,
    redactedResearcher: 'Researcher [REDACTED]'
  },
  {
    id: 'ozark-howler',
    name: 'Ozark Howler',
    scientificName: 'Felis-umbratilis',
    location: 'Ozark Mountains, Arkansas/Missouri',
    description: 'A large, black, bear-like cat with horns.',
    style: 'newspaper',
    journalEntry: `
      **Local News Clipping - [REDACTED]**
      
      Residents of the Ozark plateau have long spoken of a creature that haunts the deep hollows. Described as being as large as a bear but with the agility of a cat, the "Howler" is most famous for its terrifying cry—a sound that is said to be a mix of a wolf's howl and a human's scream. [REDACTED] found several accounts of the creature having thick, black fur and a pair of short, curved horns.
      
      The creature is said to be a harbinger of death or misfortune. [REDACTED] suggests it may be a rare species of mountain lion that has developed unusual physical traits due to isolation. However, the reports of it having glowing red eyes and being immune to gunfire suggest a more [REDACTED] nature.
      
      We spent a week in the Buffalo National River area and recorded a series of low-frequency vocalizations that match the descriptions of the Howler. The sound was powerful enough to vibrate the ground. [REDACTED] found a series of large, feline tracks near a cave entrance, but the tracks disappeared into the rocky terrain.
      
      *Signed,*
      *Naturalist [REDACTED]*
    `,
    redactedResearcher: 'Dr. [REDACTED]'
  }
];
