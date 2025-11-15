using Movies.Models.Entities;

namespace Movies.Data
{
    public static class SeedData
    {
        public static async Task SeedDatabase(MovieDbContext context)
        {
            // Check if data already exists
            if (context.Movies.Any() || context.Persons.Any() || context.Genres.Any())
                return;

            // ===== GENRES FIRST =====
            var genres = new List<Genre>
            {
                new Genre { Name = "Action" },
                new Genre { Name = "Drama" },
                new Genre { Name = "Comedy" },
                new Genre { Name = "Sci-Fi" },
                new Genre { Name = "Thriller" },
                new Genre { Name = "Crime" },
                new Genre { Name = "Romance" },
                new Genre { Name = "Adventure" },
                new Genre { Name = "Biography" },
                new Genre { Name = "Family" }
            };
            context.Genres.AddRange(genres);
            await context.SaveChangesAsync();

            // ===== MOVIES - ALLE 38 FILME AUS NEO4J MIT RATING UND SUMMARY =====
            var movies = new List<Movie>
            {
                new Movie { Title = "The Matrix", Released = 1999, Rating = 87, Summary = "A computer programmer discovers that reality as he knows it does not exist and finds himself engaged in a war between machines and humans.", Tagline = "Welcome to the Real World" },
                new Movie { Title = "The Matrix Reloaded", Released = 2003, Rating = 72, Summary = "Neo and his allies race against time before the machines discover the city of Zion and destroy it.", Tagline = "Free your mind" },
                new Movie { Title = "The Matrix Revolutions", Released = 2003, Rating = 68, Summary = "The human city of Zion defends itself against the massive invasion of the machines as Neo fights to end the war.", Tagline = "Everything that has a beginning has an end" },
                new Movie { Title = "The Devil's Advocate", Released = 1997, Rating = 75, Summary = "A lawyer finds himself in a supernatural battle between good and evil when he joins a New York law firm.", Tagline = "Evil has its winning ways" },
                new Movie { Title = "A Few Good Men", Released = 1992, Rating = 77, Summary = "Military lawyers uncover a conspiracy while defending two Marines accused of murder.", Tagline = "In the heart of the nation's capital, in a courthouse of the U.S. government, one man will stop at nothing to keep his honor, and one will stop at nothing to find the truth." },
                new Movie { Title = "Top Gun", Released = 1986, Rating = 69, Summary = "As students at the United States Navy's elite fighter weapons school compete to be best in the class, one pilot learns a few things from a civilian instructor.", Tagline = "I feel the need, the need for speed." },
                new Movie { Title = "Jerry Maguire", Released = 2000, Rating = 72, Summary = "A sports agent has a moral epiphany and is fired for expressing it. He decides to put his new philosophy to the test as an independent agent.", Tagline = "The rest of his life begins now." },
                new Movie { Title = "Stand By Me", Released = 1986, Rating = 81, Summary = "After the death of one of his friends, a writer recounts a childhood journey with his friends to find the body of a missing boy.", Tagline = "For some, it's the last real taste of innocence, and the first real taste of life. But for everyone, it's the time that memories are made of." },
                new Movie { Title = "As Good as It Gets", Released = 1997, Rating = 76, Summary = "A single mother and waitress, a misanthropic author, and a gay artist form an unlikely friendship.", Tagline = "A comedy from the heart that goes for the throat." },
                new Movie { Title = "What Dreams May Come", Released = 1998, Rating = 70, Summary = "Chris Nielsen dies in an accident, and enters Heaven. But when he discovers that his beloved wife Annie has killed herself out of grief over the loss, he embarks on an afterlife adventure to reunite with her.", Tagline = "After life there is more. The end is just the beginning." },
                new Movie { Title = "Snow Falling on Cedars", Released = 1999, Rating = 73, Summary = "A Japanese-American fisherman is accused of killing his neighbor at sea. For reporter Ishmael, the trial strikes a deep emotional chord.", Tagline = "First loves last. Forever." },
                new Movie { Title = "You've Got Mail", Released = 1998, Rating = 66, Summary = "Two business rivals who despise each other in real life fall in love over the Internet.", Tagline = "At odds in life... in love on-line." },
                new Movie { Title = "Sleepless in Seattle", Released = 1993, Rating = 68, Summary = "A recently widowed man's son calls a radio talk-show in an attempt to find his father a partner.", Tagline = "What if someone you never met, someone you never saw, someone you never knew was the only someone for you?" },
                new Movie { Title = "Joe Versus the Volcano", Released = 1990, Rating = 58, Summary = "When a hypochondriac learns that he is dying, he accepts an offer to throw himself in a volcano at a tropical island.", Tagline = "A story of love, lava and burning desire." },
                new Movie { Title = "When Harry Met Sally", Released = 1998, Rating = 76, Summary = "Harry and Sally have known each other for years, and are very good friends, but they fear sex would ruin the friendship.", Tagline = "At odds in life... in love on-line." },
                new Movie { Title = "That Thing You Do", Released = 1996, Rating = 69, Summary = "A Pennsylvania band scores a one-hit wonder in 1964 and rides the fame until infighting, creative differences and personal struggles tear the band apart.", Tagline = "In every life there comes a time when that thing you dream becomes that thing you do" },
                new Movie { Title = "The Replacements", Released = 2000, Rating = 76, Summary = "The coolest football movie ever. During a pro football strike, the owners hire substitute players.", Tagline = "Pain heals, Chicks dig scars... Glory lasts forever" },
                new Movie { Title = "RescueDawn", Released = 2006, Rating = 73, Summary = "Based on the extraordinary true story of one man's fight for freedom in the jungles of Laos.", Tagline = "Based on the extraordinary true story of one man's fight for freedom" },
                new Movie { Title = "The Birdcage", Released = 1996, Rating = 45, Summary = "Slapstick redeemed only by the Robin Williams and Gene Hackman's stellar performances.", Tagline = "Come as you are" },
                new Movie { Title = "Unforgiven", Released = 1992, Rating = 85, Summary = "Dark, but compelling western about retired gunslinger William Munny who takes on one more job.", Tagline = "It's a hell of a thing, killing a man" },
                new Movie { Title = "Johnny Mnemonic", Released = 1995, Rating = 56, Summary = "A data courier, literally carrying a data package inside his head, must deliver it before he dies from the burden.", Tagline = "The hottest data on earth. In the coolest head in town" },
                new Movie { Title = "Cloud Atlas", Released = 2012, Rating = 95, Summary = "An amazing journey through time and space exploring how the actions and consequences of individual lives impact one another.", Tagline = "Everything is connected" },
                new Movie { Title = "The Da Vinci Code", Released = 2006, Rating = 68, Summary = "A solid romp. Harvard professor Robert Langdon works with a cryptographer to solve a murder and uncover a religious mystery.", Tagline = "Break The Codes" },
                new Movie { Title = "V for Vendetta", Released = 2006, Rating = 73, Summary = "In a future British tyranny, a shadowy freedom fighter plots to overthrow it with the help of a young woman.", Tagline = "Freedom! Forever!" },
                new Movie { Title = "Speed Racer", Released = 2008, Rating = 60, Summary = "Young driver Speed Racer aspires to be champion of the racing world with the help of his family and his high-tech Mach 5 automobile.", Tagline = "Speed has no limits" },
                new Movie { Title = "Ninja Assassin", Released = 2009, Rating = 63, Summary = "A young ninja turns his back on the orphanage that raised him, leading to a confrontation with a fellow ninja from the clan.", Tagline = "Prepare to enter a secret world of assassins" },
                new Movie { Title = "The Green Mile", Released = 1999, Rating = 86, Summary = "The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape, yet who has a mysterious gift.", Tagline = "Walk a mile you'll never forget." },
                new Movie { Title = "Frost/Nixon", Released = 2008, Rating = 76, Summary = "A dramatic retelling of the post-Watergate television interviews between British talk-show host David Frost and former president Richard Nixon.", Tagline = "400 million people were waiting for the truth." },
                new Movie { Title = "Hoffa", Released = 1992, Rating = 65, Summary = "The story of the notorious American labor union leader Jimmy Hoffa, who organizes a bitter strike.", Tagline = "He didn't want law. He wanted justice." },
                new Movie { Title = "Apollo 13", Released = 1995, Rating = 77, Summary = "NASA must devise a strategy to return Apollo 13 to Earth safely after the spacecraft undergoes massive internal damage.", Tagline = "Houston, we have a problem." },
                new Movie { Title = "Twister", Released = 1996, Rating = 64, Summary = "Two storm chasers on the brink of divorce must work together to create an advanced weather alert system by putting themselves in the cross-hairs of extremely violent tornadoes.", Tagline = "Don't Breathe. Don't Look Back." },
                new Movie { Title = "Cast Away", Released = 2000, Rating = 78, Summary = "A FedEx executive undergoes a physical and emotional transformation after crash landing on a deserted island.", Tagline = "At the edge of the world, his journey begins." },
                new Movie { Title = "One Flew Over the Cuckoo's Nest", Released = 1975, Rating = 84, Summary = "A criminal pleads insanity and is admitted to a mental institution, where he rebels against the oppressive nurse and rallies up the scared patients.", Tagline = "If he's crazy, what does that make you?" },
                new Movie { Title = "Something's Gotta Give", Released = 2003, Rating = 67, Summary = "A swinger on the cusp of being a senior citizen with a history of bedding young women falls in love with an accomplished woman closer to his age." },
                new Movie { Title = "Bicentennial Man", Released = 1999, Rating = 69, Summary = "An android endeavors to become human as he gradually acquires emotions.", Tagline = "One robot's 200 year journey to become an ordinary man." },
                new Movie { Title = "Charlie Wilson's War", Released = 2007, Rating = 70, Summary = "A drama based on a Texas congressman Charlie Wilson's covert dealings in Afghanistan, where his efforts to assist rebels in their war with the Soviets have some unforeseen and long-reaching effects.", Tagline = "A stiff drink. A little mascara. A lot of nerve. Who said they couldn't bring down the Soviet empire." },
                new Movie { Title = "The Polar Express", Released = 2004, Rating = 57, Summary = "On Christmas Eve, a young boy embarks on a magical adventure to the North Pole on the Polar Express.", Tagline = "This Holiday Season… Believe" },
                new Movie { Title = "A League of Their Own", Released = 1992, Rating = 73, Summary = "Two sisters join the first female professional baseball league and struggle to help it succeed amidst their own growing rivalry.", Tagline = "Once in a lifetime you get a chance to do something different." },
                new Movie { Title = "Parasite", Released = 2019, Rating = 85, Summary = "A poor family schemes to become employed by a wealthy family and infiltrate their household by posing as unrelated, highly qualified individuals.", Tagline = "Act like you own the place" },
                new Movie { Title = "Joker", Released = 2019, Rating = 84, Summary = "In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime.", Tagline = "Put on a happy face" }
            };
            context.Movies.AddRange(movies);
            await context.SaveChangesAsync();

            // ===== PERSONS - ALLE 150+ PERSONEN AUS NEO4J =====
            var persons = new List<Person>
            {
                // Matrix Cast & Crew
                new Person { Name = "Keanu Reeves", Birthday = 1964 },
                new Person { Name = "Carrie-Anne Moss", Birthday = 1967 },
                new Person { Name = "Laurence Fishburne", Birthday = 1961 },
                new Person { Name = "Hugo Weaving", Birthday = 1960 },
                new Person { Name = "Andy Wachowski", Birthday = 1967 },
                new Person { Name = "Lana Wachowski", Birthday = 1965 },
                new Person { Name = "Joel Silver", Birthday = 1952 },
                new Person { Name = "Emil Eifrem", Birthday = 1978 },
                
                // Devil's Advocate Cast & Crew
                new Person { Name = "Charlize Theron", Birthday = 1975 },
                new Person { Name = "Al Pacino", Birthday = 1940 },
                new Person { Name = "Taylor Hackford", Birthday = 1944 },
                
                // A Few Good Men Cast & Crew
                new Person { Name = "Tom Cruise", Birthday = 1962 },
                new Person { Name = "Jack Nicholson", Birthday = 1937 },
                new Person { Name = "Demi Moore", Birthday = 1962 },
                new Person { Name = "Kevin Bacon", Birthday = 1958 },
                new Person { Name = "Kiefer Sutherland", Birthday = 1966 },
                new Person { Name = "Noah Wyle", Birthday = 1971 },
                new Person { Name = "Cuba Gooding Jr.", Birthday = 1968 },
                new Person { Name = "Kevin Pollak", Birthday = 1957 },
                new Person { Name = "J.T. Walsh", Birthday = 1943 },
                new Person { Name = "James Marshall", Birthday = 1967 },
                new Person { Name = "Christopher Guest", Birthday = 1948 },
                new Person { Name = "Rob Reiner", Birthday = 1947 },
                new Person { Name = "Aaron Sorkin", Birthday = 1961 },
                
                // Top Gun Cast & Crew
                new Person { Name = "Kelly McGillis", Birthday = 1957 },
                new Person { Name = "Val Kilmer", Birthday = 1959 },
                new Person { Name = "Anthony Edwards", Birthday = 1962 },
                new Person { Name = "Tom Skerritt", Birthday = 1933 },
                new Person { Name = "Meg Ryan", Birthday = 1961 },
                new Person { Name = "Tony Scott", Birthday = 1944 },
                new Person { Name = "Jim Cash", Birthday = 1941 },
                
                // Jerry Maguire Cast & Crew
                new Person { Name = "Renee Zellweger", Birthday = 1969 },
                new Person { Name = "Kelly Preston", Birthday = 1962 },
                new Person { Name = "Jerry O'Connell", Birthday = 1974 },
                new Person { Name = "Jay Mohr", Birthday = 1970 },
                new Person { Name = "Bonnie Hunt", Birthday = 1961 },
                new Person { Name = "Regina King", Birthday = 1971 },
                new Person { Name = "Jonathan Lipnicki", Birthday = 1996 },
                new Person { Name = "Cameron Crowe", Birthday = 1957 },
                
                // Stand By Me Cast & Crew
                new Person { Name = "River Phoenix", Birthday = 1970 },
                new Person { Name = "Corey Feldman", Birthday = 1971 },
                new Person { Name = "Wil Wheaton", Birthday = 1972 },
                new Person { Name = "John Cusack", Birthday = 1966 },
                new Person { Name = "Marshall Bell", Birthday = 1942 },
                
                // As Good as It Gets Cast & Crew
                new Person { Name = "Helen Hunt", Birthday = 1963 },
                new Person { Name = "Greg Kinnear", Birthday = 1963 },
                new Person { Name = "James L. Brooks", Birthday = 1940 },
                
                // What Dreams May Come Cast & Crew
                new Person { Name = "Annabella Sciorra", Birthday = 1960 },
                new Person { Name = "Max von Sydow", Birthday = 1929 },
                new Person { Name = "Werner Herzog", Birthday = 1942 },
                new Person { Name = "Robin Williams", Birthday = 1951 },
                new Person { Name = "Vincent Ward", Birthday = 1956 },
                
                // Snow Falling on Cedars Cast & Crew
                new Person { Name = "Ethan Hawke", Birthday = 1970 },
                new Person { Name = "Rick Yune", Birthday = 1971 },
                new Person { Name = "James Cromwell", Birthday = 1940 },
                new Person { Name = "Scott Hicks", Birthday = 1953 },
                
                // You've Got Mail Cast & Crew
                new Person { Name = "Parker Posey", Birthday = 1968 },
                new Person { Name = "Dave Chappelle", Birthday = 1973 },
                new Person { Name = "Steve Zahn", Birthday = 1967 },
                new Person { Name = "Tom Hanks", Birthday = 1956 },
                new Person { Name = "Nora Ephron", Birthday = 1941 },
                
                // Sleepless in Seattle Cast & Crew
                new Person { Name = "Rita Wilson", Birthday = 1956 },
                new Person { Name = "Bill Pullman", Birthday = 1953 },
                new Person { Name = "Victor Garber", Birthday = 1949 },
                new Person { Name = "Rosie O'Donnell", Birthday = 1962 },
                
                // Joe Versus the Volcano Cast & Crew
                new Person { Name = "John Patrick Stanley", Birthday = 1950 },
                new Person { Name = "Nathan Lane", Birthday = 1956 },
                
                // When Harry Met Sally Cast & Crew
                new Person { Name = "Billy Crystal", Birthday = 1948 },
                new Person { Name = "Carrie Fisher", Birthday = 1956 },
                new Person { Name = "Bruno Kirby", Birthday = 1949 },
                
                // That Thing You Do Cast & Crew
                new Person { Name = "Liv Tyler", Birthday = 1977 },
                
                // The Replacements Cast & Crew
                new Person { Name = "Brooke Langton", Birthday = 1970 },
                new Person { Name = "Gene Hackman", Birthday = 1930 },
                new Person { Name = "Orlando Jones", Birthday = 1968 },
                new Person { Name = "Howard Deutch", Birthday = 1950 },
                
                // RescueDawn Cast & Crew
                new Person { Name = "Christian Bale", Birthday = 1974 },
                new Person { Name = "Zach Grenier", Birthday = 1954 },
                
                // The Birdcage Cast & Crew
                new Person { Name = "Mike Nichols", Birthday = 1931 },
                
                // Unforgiven Cast & Crew
                new Person { Name = "Richard Harris", Birthday = 1930 },
                new Person { Name = "Clint Eastwood", Birthday = 1930 },
                
                // Johnny Mnemonic Cast & Crew
                new Person { Name = "Takeshi Kitano", Birthday = 1947 },
                new Person { Name = "Dina Meyer", Birthday = 1968 },
                new Person { Name = "Ice-T", Birthday = 1958 },
                new Person { Name = "Robert Longo", Birthday = 1953 },
                
                // Cloud Atlas Cast & Crew
                new Person { Name = "Halle Berry", Birthday = 1966 },
                new Person { Name = "Jim Broadbent", Birthday = 1949 },
                new Person { Name = "Tom Tykwer", Birthday = 1965 },
                
                // The Da Vinci Code Cast & Crew
                new Person { Name = "Ian McKellen", Birthday = 1939 },
                new Person { Name = "Audrey Tautou", Birthday = 1976 },
                new Person { Name = "Paul Bettany", Birthday = 1971 },
                new Person { Name = "Ron Howard", Birthday = 1954 },
                
                // V for Vendetta Cast & Crew
                new Person { Name = "Natalie Portman", Birthday = 1981 },
                new Person { Name = "Stephen Rea", Birthday = 1946 },
                new Person { Name = "John Hurt", Birthday = 1940 },
                new Person { Name = "Ben Miles", Birthday = 1967 },
                
                // Speed Racer Cast & Crew
                new Person { Name = "Emile Hirsch", Birthday = 1985 },
                new Person { Name = "John Goodman", Birthday = 1960 },
                new Person { Name = "Susan Sarandon", Birthday = 1946 },
                new Person { Name = "Matthew Fox", Birthday = 1966 },
                new Person { Name = "Christina Ricci", Birthday = 1980 },
                new Person { Name = "Rain", Birthday = 1982 },
                
                // Ninja Assassin Cast & Crew
                new Person { Name = "Naomie Harris" }, // Kein born im Neo4j-Skript
                
                // The Green Mile Cast & Crew
                new Person { Name = "Michael Clarke Duncan", Birthday = 1957 },
                new Person { Name = "David Morse", Birthday = 1953 },
                new Person { Name = "Sam Rockwell", Birthday = 1968 },
                new Person { Name = "Gary Sinise", Birthday = 1955 },
                new Person { Name = "Patricia Clarkson", Birthday = 1959 },
                new Person { Name = "Frank Darabont", Birthday = 1959 },
                
                // Frost/Nixon Cast & Crew
                new Person { Name = "Frank Langella", Birthday = 1938 },
                new Person { Name = "Michael Sheen", Birthday = 1969 },
                new Person { Name = "Oliver Platt", Birthday = 1960 },
                
                // Hoffa Cast & Crew
                new Person { Name = "Danny DeVito", Birthday = 1944 },
                new Person { Name = "John C. Reilly", Birthday = 1965 },
                
                // Apollo 13 Cast & Crew
                new Person { Name = "Ed Harris", Birthday = 1950 },
                new Person { Name = "Bill Paxton", Birthday = 1955 },
                
                // Twister Cast & Crew
                new Person { Name = "Philip Seymour Hoffman", Birthday = 1967 },
                new Person { Name = "Jan de Bont", Birthday = 1943 },
                
                // Cast Away Cast & Crew
                new Person { Name = "Robert Zemeckis", Birthday = 1951 },
                
                // One Flew Over the Cuckoo's Nest Cast & Crew
                new Person { Name = "Milos Forman", Birthday = 1932 },
                
                // Something's Gotta Give Cast & Crew
                new Person { Name = "Diane Keaton", Birthday = 1946 },
                new Person { Name = "Nancy Meyers", Birthday = 1949 },
                
                // Bicentennial Man Cast & Crew
                new Person { Name = "Chris Columbus", Birthday = 1958 },
                
                // Charlie Wilson's War Cast & Crew
                new Person { Name = "Julia Roberts", Birthday = 1967 },
                
                // A League of Their Own Cast & Crew
                new Person { Name = "Madonna", Birthday = 1954 },
                new Person { Name = "Geena Davis", Birthday = 1956 },
                new Person { Name = "Lori Petty", Birthday = 1963 },
                new Person { Name = "Penny Marshall", Birthday = 1943 },
                
                // User-Personen (Reviews aus Neo4j)
                new Person { Name = "Paul Blythe" },        // Kein born im Neo4j-Skript
                new Person { Name = "Angela Scope" },       // Kein born im Neo4j-Skript
                new Person { Name = "Jessica Thompson" },   // Kein born im Neo4j-Skript
                new Person { Name = "James Thompson" },     // Kein born im Neo4j-Skript
                
                // Parasite Cast
                new Person { Name = "Kang-ho Song" },       // Kein born im Neo4j-Skript
                new Person { Name = "Sun-kyun Lee" },       // Kein born im Neo4j-Skript
                new Person { Name = "Yeo-jeong Jo" },       // Kein born im Neo4j-Skript
                new Person { Name = "Woo-sik Choi" },       // Kein born im Neo4j-Skript
                new Person { Name = "So-dam Park" },        // Kein born im Neo4j-Skript
                
                // Joker Cast
                new Person { Name = "Joaquin Phoenix" },    // Kein born im Neo4j-Skript
                new Person { Name = "Robert De Niro" },     // Kein born im Neo4j-Skript
                new Person { Name = "Zazie Beetz" }         // Kein born im Neo4j-Skript
            };
            context.Persons.AddRange(persons);
            await context.SaveChangesAsync();
        }
    }
}