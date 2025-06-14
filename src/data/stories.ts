export interface Story {
  id: string;
  title: string;
  summary: string;
  category: string;
  ageRange: string;
  coverImage: string;
  content: string;
  readingTime: string;
}

export const storyCategories = [
  "Animals",
  "Adventure",
  "Fantasy", 
  "Bedtime",
  "Educational",
  "Moral Stories",
  "Fables"
];

export const stories: Story[] = [
  {
    id: "1",
    title: "The Clever Monkey",
    summary: "A clever monkey outwits a crocodile who tries to trick him.",
    category: "Fables",
    ageRange: "4-8",
    coverImage: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `Once upon a time, there lived a monkey who resided on a berry tree on the banks of a river. The monkey was alone, as he had no friends or relatives. In the same river, there lived a crocodile and his wife. One day, the crocodile wandered deep into the river and came to rest under the berry tree, where the monkey lived.

The crocodile, having swum a great distance, was tired and hungry. The kind-hearted monkey saw that the crocodile was tired and offered him some berries. The crocodile thanked the monkey and enjoyed the sweet berries. The crocodile enjoyed the berries so much that he visited the monkey every day. The monkey and the crocodile became good friends.

One day, the crocodile took some berries home for his wife. His wife found the berries to be the sweetest she had ever tasted. This made her wonder about the monkey. She thought that if the monkey ate such sweet berries every day, his flesh would be even sweeter. She asked her husband to invite the monkey home for dinner so that she could eat the monkey's heart.

The crocodile was not happy about this. He didn't want to deceive his friend. But his wife was adamant. She threatened to starve herself and even leave the house if he didn't bring the monkey home. The crocodile had no choice but to obey her.

The next day, the crocodile swam to the berry tree and invited the monkey to his home. The excited monkey agreed. But the monkey couldn't swim, so the crocodile suggested that he sit on his back and he would carry him to his house. The monkey agreed and jumped onto the crocodile's back.

While they were in the middle of the river, the crocodile began to sink into the river. The monkey was terrified. The crocodile told the monkey that he was taking him home so that his wife could eat his heart. The clever monkey thought quickly and said, "My friend, you should have told me this before we left. I left my heart on the berry tree. Let's go back and get it."

The foolish crocodile believed him and swam back to the berry tree. Upon reaching the berry tree, the monkey quickly climbed up the tree and said, "O foolish crocodile, how can anyone keep their heart on a tree? I'm not coming down from here. Go home and tell your wicked wife that she cannot eat my heart."

The crocodile felt ashamed of betraying his friend and swam home. The clever monkey saved his life with his wit and intelligence.`,
    readingTime: "5 min"
  },
  {
    id: "2",
    title: "The Cap Seller and the Monkeys",
    summary: "A cap seller finds a clever way to get back his caps from mischievous monkeys.",
    category: "Fables",
    ageRange: "4-8",
    coverImage: "https://images.unsplash.com/photo-1578617994183-730154e93ab4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `Once upon a time, there was a cap seller in a city. He used to go from village to village to sell his caps. His way passed through a forest. It was a hot summer day, and he got tired after walking for a long time in the forest. So, he decided to take rest under a tree.

He kept his bag full of caps beside him and went to sleep. After some hours, when he woke up, he found that all his caps were missing. He looked around, but he couldn't find them anywhere.

Suddenly, he looked up at the tree and was surprised to see monkeys sitting on its branches, each wearing a cap that belonged to him. He tried to scare the monkeys and make them drop his caps, but they only mimicked him and didn't drop any cap.

After trying a lot, he finally gave up and started walking away in disappointment. But then, he got an idea. The cap seller threw his own cap on the ground and the monkeys, who were imitating him all the time, did the same. They threw all the caps on the ground.

The cap seller quickly collected all his caps, put them back in his bag, and went on his way, feeling very clever for outwitting the monkeys.

Moral of the story: Sometimes we can find solutions to our problems by thinking outside the box.`,
    readingTime: "4 min"
  },
  {
    id: "3",
    title: "The Fox and the Grapes",
    summary: "A fox tries to reach some high-hanging grapes but fails and declares them sour.",
    category: "Fables",
    ageRange: "3-7",
    coverImage: "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `One hot summer day, a fox was walking through an orchard. He was very hungry and tired. Suddenly, he saw a bunch of grapes hanging from a vine high up on a tree. The grapes looked ripe, juicy, and sweet. The fox's mouth watered at the sight of the delicious-looking grapes.

He wanted to eat the grapes, but they were too high for him to reach. He tried jumping up to grab them, but they were still out of his reach. He tried again and again, jumping as high as he could, but he just couldn't reach the grapes.

Finally, after many attempts, the fox gave up. He was tired and even hungrier now. As he walked away, he looked back at the grapes and said, "I'm sure those grapes are sour anyway. I don't want to eat sour grapes."

And with that, the fox continued on his way, telling himself that the grapes weren't worth his effort.

Moral of the story: It's easy to despise what you cannot have.`,
    readingTime: "3 min"
  },
  {
    id: "4",
    title: "The Ant and the Grasshopper",
    summary: "A tale about the importance of hard work and planning for the future.",
    category: "Fables",
    ageRange: "4-9",
    coverImage: "https://images.unsplash.com/photo-1525923838299-2312b60f6d69?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `In a field one summer's day, a Grasshopper was hopping about, chirping and singing to its heart's content. An Ant passed by, bearing along with great effort an ear of corn he was taking to the nest.

"Why not come and chat with me," said the Grasshopper, "instead of toiling in that way?"

"I am helping to lay up food for the winter," said the Ant, "and recommend you to do the same."

"Why bother about winter?" said the Grasshopper; "we have plenty of food at present."

But the Ant went on its way and continued its toil. When winter came, the Grasshopper found itself dying of hunger, while it saw the ants distributing, every day, corn and grain from the stores they had collected in the summer.

Then the Grasshopper knew: It is best to prepare for the days of necessity.

Moral of the story: Work today for a better tomorrow. Don't waste time when you should be working.`,
    readingTime: "3 min"
  },
  {
    id: "5",
    title: "The Thirsty Crow",
    summary: "A clever crow finds a way to drink water from a pitcher by dropping pebbles into it.",
    category: "Fables",
    ageRange: "3-8",
    coverImage: "https://images.unsplash.com/photo-1557387712-a73be95a5c12?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `Once upon a time, there was a crow who was very thirsty. It had been a hot, dry day, and the crow had flown a long distance but hadn't found any water to drink. The crow was feeling weak and desperate.

Finally, the crow spotted a pitcher on the ground. Excited, it flew down and looked inside. There was some water in the pitcher, but it was at the very bottom, and the crow couldn't reach it with its beak.

The crow tried to push the pitcher over, hoping the water would spill out, but the pitcher was too heavy. The crow was getting more and more thirsty and worried.

Suddenly, the crow had an idea. It saw some small pebbles nearby. The crow picked up a pebble with its beak and dropped it into the pitcher. Then it got another pebble and dropped it in too. The crow kept adding pebbles to the pitcher.

Slowly, as more and more pebbles filled the pitcher, the water level began to rise. Finally, the water reached the top of the pitcher where the crow could reach it. The crow drank the water and felt much better.

Moral of the story: Where there's a will, there's a way. With clever thinking and persistence, we can solve difficult problems.`,
    readingTime: "4 min"
  },
  {
    id: "1",
    title: "The Curious Fox",
    summary: "A young fox explores the forest and learns about friendship.",
    category: "Animals",
    ageRange: "3-6",
    coverImage: "https://images.unsplash.com/photo-1500252185289-40ca85eb23a7?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `Once upon a time, there was a little fox named Finn who lived in a cozy den at the edge of a vast forest. Finn was different from the other foxes. While they spent their days hunting and napping, Finn was endlessly curious about the world beyond the trees he knew so well.

One sunny morning, Finn decided it was time for an adventure. "I'll be back before sunset," he promised his mother, who smiled and nodded, knowing her little fox needed to explore.

Finn trotted through the familiar paths, his bright eyes taking in everything around him. Soon, he reached a part of the forest he had never seen before. The trees here were taller, and the sunlight filtered through the leaves in dancing patterns.

As he was admiring a particularly sparkly stream, Finn heard a small sound. It was a rabbit, caught in a tangle of thorny bushes.

"Stay still," Finn said gently, approaching the frightened rabbit. "I can help you."

The rabbit trembled. "But you're a fox! Foxes eat rabbits."

Finn tilted his head. "I'm not hungry right now. And you need help."

Carefully, Finn used his sharp teeth to cut through the vines, freeing the rabbit.

"Thank you," the rabbit said, surprised. "My name is Hop."

"I'm Finn," the fox replied. "Would you like to explore with me?"

And so, the curious fox and the grateful rabbit spent the day discovering wonders in the forest together. They found a family of hedgehogs collecting berries, helped a lost butterfly find its way back to its garden, and watched fish leap in a clear pond.

As the sun began to set, casting an orange glow across the sky, Finn realized it was time to go home.

"Will I see you again?" asked Hop.

"Of course," Finn replied. "Friends always find their way back to each other."

When Finn returned to his den, his mother was waiting. "Did you have a good adventure?" she asked.

Finn curled up beside her, his eyes shining. "The best," he said. "I learned something important today."

"What's that?" his mother asked.

"Sometimes the greatest discovery isn't a place," Finn said wisely. "Sometimes it's a friend."

And as the stars came out, twinkling in the night sky, Finn fell asleep, dreaming of all the adventures yet to come.`,
    readingTime: "5 min"
  },
  {
    id: "2",
    title: "The Magic Paintbrush",
    summary: "A child discovers a paintbrush that brings drawings to life.",
    category: "Fantasy",
    ageRange: "4-8",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `In a small village nestled between rolling hills, there lived a little girl named Mei. Mei loved to draw more than anything in the world, but her family was poor and could not afford fancy art supplies. She drew with sticks in the dirt and used charcoal from the fire on scraps of paper.

One day, while helping an old woman carry her groceries home, Mei was given a gift: a simple wooden paintbrush.

"This is no ordinary paintbrush," the old woman whispered. "It has magic for those with kind hearts."

Mei thanked her and rushed home, eager to try her new paintbrush. She found a piece of paper and dipped the brush in water, wishing she had real paint. To her amazement, as she moved the brush across the paper, beautiful colors appeared!

Excitedly, Mei painted a butterfly with delicate wings of blue and purple. As she finished the last stroke, the butterfly fluttered off the page and into the air! Mei gasped in delight as it circled her head before flying out the window.

Mei discovered that anything she painted with her magic brush would come to life, but only for a short time before returning to the paper. She painted fruits for hungry children, warm blankets for the elderly during winter, and toys for those who had none.

Word of Mei's magical paintings spread, and soon the greedy village leader demanded that she paint gold and jewels for him.

"I will not," Mei said firmly. "This brush was given to me to help others, not to create riches."

The angry leader stole Mei's paintbrush while she slept. He tried to paint piles of gold, but instead, black mud poured from the brush, covering him from head to toe. No matter how hard he tried, the paintbrush would not create treasures for him.

Defeated, he returned the brush to Mei. "The magic doesn't work for me," he complained.

Mei smiled knowingly. "The brush only works for those who paint from the heart, not from greed."

From that day on, Mei continued to create her magical paintings, bringing brief moments of joy and wonder to her village. She grew up to be a renowned artist, though few knew the true secret of why her paintings seemed so alive.

And the magic paintbrush? It remained with Mei until she found another kind-hearted child who needed it more than she did, continuing the circle of creativity and kindness for generations to come.`,
    readingTime: "7 min"
  },
  {
    id: "3",
    title: "The Lonely Star",
    summary: "A star searches for friendship in the night sky.",
    category: "Bedtime",
    ageRange: "3-6",
    coverImage: "https://images.unsplash.com/photo-1622664843830-fad176b1fd54?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `High up in the velvet night sky, past the clouds and airplanes, lived a little star named Stella. Stella twinkled and shone like all the other stars, but she felt different. While the other stars clustered together in beautiful constellations, telling stories with their patterns, Stella was alone in her corner of the sky.

"Why am I all by myself?" Stella wondered as she watched the Ursa Major stars laughing together. The Seven Sisters twinkled in unison, and even the planets seemed to have friends as they moved along their paths.

Stella tried to make herself shine brighter, hoping someone would notice her. She tried dimming her light to save energy for a spectacular flash. But no matter what she did, she remained alone in her patch of sky.

One particularly quiet night, Stella noticed something she hadn't seen before: her light was reaching Earth. Far below, a little girl was looking up at the sky through a telescope.

"Look, Daddy!" the girl exclaimed. "I found a star all on its own. It's my star!"

The girl's father smiled. "That's a special kind of star. Some call them 'wishing stars' because they're rare and perfect for making wishes on."

Stella sparkled with happiness. She wasn't lonely—she was special!

That night, the little girl made a wish on Stella, and somehow, Stella could feel it traveling all the way up to her. It felt warm and wonderful, like a hug made of light.

Night after night, the girl returned to look at Stella. Sometimes she brought friends, who would also make wishes. Stella realized that by being on her own, she was easier to find and more meaningful to the children below.

Other stars began to notice. "How do you get so many wishes?" they asked.

"By being exactly who I am," Stella replied.

Over time, Stella discovered that there were other solitary stars like her, scattered across the sky. They began to twinkle messages to one another, forming a different kind of constellation—one that couldn't be seen unless you knew just where to look.

And while the constellations told ancient stories written long ago, Stella and her distant friends collected wishes and dreams, becoming part of new stories being written by children all over the world.

As the little girl grew older, she never forgot her special star. And Stella never felt lonely again, knowing that even from millions of miles away, she was connected to someone who cared.

So when you look up at the night sky and see a star twinkling all on its own, remember Stella, and know that sometimes standing apart is what makes you shine the brightest.`,
    readingTime: "6 min"
  },
  {
    id: "4",
    title: "The Great Garden Adventure",
    summary: "Tiny insects embark on an epic journey across a garden.",
    category: "Adventure",
    ageRange: "4-8",
    coverImage: "https://images.unsplash.com/photo-1525498128493-380d1990a112?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `Beneath the towering sunflowers and sprawling tomato plants of Mrs. Wilson's garden, an incredible world thrived. To humans, it was just a garden, but to the tiny creatures who lived there, it was an entire universe of adventure.

Arlo the ant was known throughout the garden as a bit of a dreamer. While the other ants marched in perfect lines, collecting food and building their colony, Arlo would often pause to watch butterflies dance or listen to the stories told by ancient beetles.

One morning, during the regular food collection routine, Arlo overheard the gardener's radio. "...and forecasts predict the heaviest rainfall in fifty years," crackled the weather announcer.

Arlo froze. Rain wasn't just weather to the garden inhabitants—it was a catastrophic event that could wash away homes and food supplies. He had to warn everyone!

Rushing back to the ant colony, Arlo tried to tell the colony leader about the coming storm, but no one would listen. "Back to work, Arlo," they said. "No time for more of your stories."

Determined to save his friends throughout the garden, Arlo set off alone. His journey would take him across what humans considered a small backyard, but to an ant, it was an epic quest through diverse and dangerous terrain.

First, Arlo visited the beehive, where his friend Bella the bee helped spread the word among the flying creatures. Next, he navigated the "Pebble Mountains" to reach the snail community, who were slow but had strong shells that could serve as shelters.

As Arlo traveled, word of his mission spread. Soon, he was joined by Dot, a clever ladybug; Max, a daring grasshopper; and Willow, a wise caterpillar. Together, they formed a team, each contributing unique skills to overcome obstacles.

They crossed the "Bird Bath Ocean" on a leaf boat, narrowly escaped a hungry robin, and trekked through the "Sandbox Desert." Along the way, they rallied the garden inhabitants, showing them how to secure their homes and create shelters for those without protection.

The first heavy raindrops began to fall just as the team reached the far corner of the garden, where the youngest seedlings grew. Working together with dozens of insects, they created tiny canopies from flower petals and leaves, built channels to direct water away from vulnerable nests, and gathered enough food to last until the garden dried.

When the storm finally passed, the garden was changed, but thanks to Arlo and his friends, every creature had survived. The colony leader approached Arlo with newfound respect.

"You saw what we could not," she admitted. "From now on, we will listen to different perspectives, even when they don't match our own."

Arlo smiled as he looked at his diverse group of friends. Their adventure had done more than save the garden—it had brought together creatures who had never worked together before.

And whenever new dangers threatened the garden, the inhabitants knew they could face them—together.`,
    readingTime: "8 min"
  },
  {
    id: "5",
    title: "The Dancing Dinosaur",
    summary: "A dinosaur discovers the joy of dancing despite being different.",
    category: "Educational",
    ageRange: "5-9",
    coverImage: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    content: `Millions and millions of years ago, when dinosaurs ruled the Earth, there lived a young Parasaurolophus named Penny. Parasaurolophuses had long, curved crests on their heads, which they used to make loud, trumpeting calls to each other.

But Penny was different. When other dinosaurs used their crests to make loud bellowing sounds, Penny's crest produced musical notes that sounded like a beautiful horn.

"Why can't you trumpet properly?" her brother would ask.

"Your calls are so strange," her friends would say.

Penny felt sad and tried to practice making the right sounds, but every time she blew air through her crest, out came wonderful melodies instead of the expected trumpets.

One day, while practicing alone by the river, Penny noticed something amazing. When she made her musical sounds, her feet started to tap. Her tail began to sway. Her whole body wanted to move!

Following her instincts, Penny let her body move to the music she created. She stepped left, then right. She swayed and turned. She was dancing! It felt wonderful and natural, like this was exactly what she was meant to do.

A tiny mammal watching from the bushes started to copy her movements. Then a young Triceratops wandering by began to sway too. Soon, several dinosaurs were gathered around, moving to Penny's musical crest sounds.

"What is this?" asked an elder Stegosaurus.

"I call it dancing," Penny said shyly. "It's moving your body to music."

The elder looked confused. "But what purpose does it serve? Does it help find food? Escape predators?"

Penny thought carefully. "It makes us happy," she finally answered. "And when we're happy together, maybe we work better together too."

The dinosaurs weren't convinced at first, but Penny continued dancing every day. Scientists today don't know this, but Penny actually invented dancing in the dinosaur world!

More and more dinosaurs joined her, discovering that dancing together was not only fun but helped them remember migration routes, celebrate successful hunts, and even warn each other of danger through special dance moves.

Even Penny's family began to appreciate her special talent. Her musical crest wasn't a mistake—it was evolution trying something new, something that brought joy.

Many years later, paleontologists (scientists who study dinosaurs) would discover fossilized footprints in unusual circular patterns. They would wonder why dinosaurs would move in such ways. If only they knew about Penny, the dancing Parasaurolophus, who taught the ancient world to dance!

And though dinosaurs eventually disappeared from Earth, the joy of moving to music continued. From birds' mating dances to elephants swaying to sounds, the spirit of Penny's discovery lived on.

So remember, when you dance and make music, you're connecting to something very ancient and special—a happy discovery made by a dinosaur who wasn't afraid to be different.`,
    readingTime: "7 min"
  }
];
