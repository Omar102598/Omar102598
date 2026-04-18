import type { TopicCategory } from '../types';

export interface ArticleResource {
  type: 'video' | 'link' | 'visualizer';
  title: string;
  url: string;
  /** YouTube video ID — only present when type === 'video' */
  youtubeId?: string;
}

export interface ArticleSection {
  heading: string;
  content: string;
}

export interface Article {
  id: TopicCategory;
  title: string;
  icon: string;
  tagline: string;
  heroImage: string;
  overview: string;
  sections: ArticleSection[];
  complexity: { best?: string; average: string; worst: string; space: string };
  resources: ArticleResource[];
}

export const articles: Article[] = [
  /* ------------------------------------------------------------------ */
  /*  Arrays & Strings                                                   */
  /* ------------------------------------------------------------------ */
  {
    id: 'arrays-strings',
    title: 'Arrays & Strings',
    icon: '📊',
    tagline: 'The foundation of every coding interview',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Array1.svg/800px-Array1.svg.png',
    overview:
      'Arrays are the most fundamental data structure — a contiguous block of memory that stores elements of the same type, accessible by index in O(1) time. Strings are essentially arrays of characters. Mastering array and string manipulation is essential because the majority of interview questions either directly use arrays or build on techniques that originate from array traversal patterns.',
    sections: [
      {
        heading: 'How Arrays Work in Memory',
        content:
          'An array allocates a contiguous block of memory. Each element occupies the same amount of space, so accessing element `i` is as simple as computing `base_address + i * element_size`. This gives **O(1)** random access — the key advantage of arrays over linked lists.\n\nHowever, inserting or deleting elements in the middle requires shifting all subsequent elements, making those operations **O(n)**.',
      },
      {
        heading: 'Common Array Techniques',
        content:
          '• **Prefix sums** — precompute cumulative sums to answer range-sum queries in O(1).\n• **Kadane\'s algorithm** — find the maximum subarray sum in O(n).\n• **Dutch National Flag** — partition an array into three sections in a single pass.\n• **In-place reversal** — reverse sub-sections of an array without extra space.\n• **Frequency counting** — use a fixed-size array as a lightweight hash map for character counting.',
      },
      {
        heading: 'String-Specific Patterns',
        content:
          '• **Palindrome checking** — use two pointers from both ends.\n• **Anagram detection** — compare sorted versions or character frequency arrays.\n• **Substring search** — brute-force O(nm) vs. KMP O(n+m) vs. Rabin-Karp with rolling hash.\n• **String building** — avoid repeated concatenation (O(n²)); use arrays / StringBuilder instead.',
      },
      {
        heading: 'Interview Tips',
        content:
          '1. Always clarify whether the array is sorted — it unlocks binary search and two-pointer patterns.\n2. Ask about duplicates and negative numbers; they change the approach.\n3. Think about **in-place** vs. **extra-space** trade-offs.\n4. For strings, ask about character set (ASCII vs. Unicode) to size your frequency array.',
      },
    ],
    complexity: {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
      space: 'O(n)',
    },
    resources: [
      {
        type: 'video',
        title: 'Arrays — Data Structures (mycodeschool)',
        url: 'https://www.youtube.com/watch?v=D6xkbGLQesk',
        youtubeId: 'D6xkbGLQesk',
      },
      {
        type: 'video',
        title: 'Data Structures Full Animated Course (ByteQuest)',
        url: 'https://www.youtube.com/watch?v=8hly31xKli0',
        youtubeId: '8hly31xKli0',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Array Visualisation',
        url: 'https://visualgo.net/en/array',
      },
      {
        type: 'link',
        title: 'LeetCode Explore — Arrays 101',
        url: 'https://leetcode.com/explore/learn/card/fun-with-arrays/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Hash Maps & Sets                                                   */
  /* ------------------------------------------------------------------ */
  {
    id: 'hash-maps',
    title: 'Hash Maps & Sets',
    icon: '🗂️',
    tagline: 'O(1) lookups that unlock dozens of patterns',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Hash_table_3_1_1_0_1_0_0_SP.svg/630px-Hash_table_3_1_1_0_1_0_0_SP.svg.png',
    overview:
      'A hash map (dictionary) stores key–value pairs and provides average O(1) insert, delete, and lookup. Under the hood it uses a hash function to map keys to array indices. Hash sets are similar but only store keys. These structures are interview gold — the famous "Two Sum" problem is solved with a single hash map pass.',
    sections: [
      {
        heading: 'How Hashing Works',
        content:
          'A **hash function** converts a key into an integer index. A good hash function distributes keys uniformly to minimise collisions. When two keys map to the same index (a **collision**), the hash map resolves it using:\n\n• **Chaining** — each bucket holds a linked list of entries.\n• **Open addressing** — probe the next available slot (linear probing, quadratic probing, double hashing).\n\nThe **load factor** (n / capacity) governs when the table resizes — typically at 0.75 the table doubles in size and rehashes all entries.',
      },
      {
        heading: 'Common Interview Patterns',
        content:
          '• **Two Sum pattern** — store complements in a map for O(n) lookups.\n• **Frequency counting** — count occurrences of elements to detect duplicates, anagrams, or majorities.\n• **Group by key** — group anagrams, group by frequency, etc.\n• **Subarray sum equals k** — combine prefix sums with a hash map for O(n) solutions.\n• **Hash set for O(1) membership** — check visited nodes, detect cycles, find intersections.',
      },
      {
        heading: 'Hash Map vs. Other Structures',
        content:
          '| Operation | Hash Map | Sorted Array | BST |\n|-----------|----------|-------------|-----|\n| Search    | O(1) avg | O(log n)    | O(log n) |\n| Insert    | O(1) avg | O(n)        | O(log n) |\n| Delete    | O(1) avg | O(n)        | O(log n) |\n| Ordered?  | No       | Yes         | Yes |\n\nUse a hash map when you need fast lookups and don\'t need ordering. Use a tree map / sorted structure when you need sorted keys.',
      },
    ],
    complexity: {
      average: 'O(1)',
      worst: 'O(n)',
      space: 'O(n)',
    },
    resources: [
      {
        type: 'video',
        title: 'Hash Tables and Hash Functions (Computer Science)',
        url: 'https://www.youtube.com/watch?v=KyUTuwz_b7Q',
        youtubeId: 'KyUTuwz_b7Q',
      },
      {
        type: 'video',
        title: 'Hash Tables — CS50 (Harvard)',
        url: 'https://www.youtube.com/watch?v=nvzVHwrrub0',
        youtubeId: 'nvzVHwrrub0',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Hash Table Visualisation',
        url: 'https://visualgo.net/en/hashtable',
      },
      {
        type: 'link',
        title: 'LeetCode — Top Interview 150 (Hash Map)',
        url: 'https://leetcode.com/studyplan/top-interview-150/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Two Pointers                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'two-pointers',
    title: 'Two Pointers',
    icon: '👆',
    tagline: 'Scan from both ends to meet in the middle',
    heroImage: 'https://assets.leetcode.com/uploads/2020/10/14/two_pointer.png',
    overview:
      'The two-pointer technique uses two indices that move toward each other (or in the same direction) to solve problems in O(n) time that might otherwise require O(n²). It\'s especially powerful on sorted arrays and strings. Classic examples include finding pair sums, removing duplicates in-place, and the container-with-most-water problem.',
    sections: [
      {
        heading: 'Opposite-Direction Pointers',
        content:
          'Place one pointer at the start and one at the end. Move them inward based on a condition:\n\n```\nleft = 0, right = n - 1\nwhile left < right:\n    if condition met: record result\n    if need more: move left++\n    else: move right--\n```\n\n**Examples:** Two Sum II (sorted), Container With Most Water, Valid Palindrome, Trapping Rain Water.',
      },
      {
        heading: 'Same-Direction (Fast & Slow) Pointers',
        content:
          'Both pointers start at the beginning. The "fast" pointer advances every step; the "slow" pointer advances only when a condition is met.\n\n**Use cases:**\n• Remove duplicates from sorted array — slow marks the write position, fast scans ahead.\n• Move zeroes — partition non-zero elements to the front.\n• Linked list cycle detection (Floyd\'s algorithm).',
      },
      {
        heading: 'When to Use Two Pointers',
        content:
          '✅ The input is **sorted** (or can be sorted without breaking the problem).\n✅ You\'re searching for a **pair or triplet** that satisfies a sum/difference condition.\n✅ You need to **partition** or **rearrange** elements in-place.\n✅ The problem asks for the **longest/shortest** window (often combined with sliding window).\n\n❌ Don\'t force it when the data has no meaningful ordering.',
      },
    ],
    complexity: {
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(1)',
    },
    resources: [
      {
        type: 'video',
        title: 'Two Pointers Technique — NeetCode',
        url: 'https://www.youtube.com/watch?v=cQ1Oz4ckceM',
        youtubeId: 'cQ1Oz4ckceM',
      },
      {
        type: 'video',
        title: 'Two Pointers Algorithm Explained',
        url: 'https://www.youtube.com/watch?v=-gjxg6Pln50',
        youtubeId: '-gjxg6Pln50',
      },
      {
        type: 'link',
        title: 'NeetCode — Two Pointers Roadmap',
        url: 'https://neetcode.io/roadmap',
      },
      {
        type: 'visualizer',
        title: 'See Algorithms — Two Pointers',
        url: 'https://see-algorithms.com',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Sliding Window                                                     */
  /* ------------------------------------------------------------------ */
  {
    id: 'sliding-window',
    title: 'Sliding Window',
    icon: '🪟',
    tagline: 'Efficiently process contiguous subarrays and substrings',
    heroImage: 'https://assets.leetcode.com/uploads/2020/09/21/sliding_window.png',
    overview:
      'The sliding window technique maintains a "window" (a contiguous subarray/substring) that expands and contracts as it slides across the input. It reduces brute-force O(n²) or O(n·k) solutions to O(n). There are two flavours: fixed-size windows and variable-size windows.',
    sections: [
      {
        heading: 'Fixed-Size Window',
        content:
          'When the window size `k` is given, initialise the window with the first `k` elements, then slide by adding the next element and removing the leftmost:\n\n```\nwindowSum = sum(arr[0..k-1])\nfor i in range(k, n):\n    windowSum += arr[i] - arr[i - k]\n    update answer\n```\n\n**Examples:** Maximum sum subarray of size k, moving averages.',
      },
      {
        heading: 'Variable-Size Window',
        content:
          'Expand the right pointer to include more elements. When a condition is violated, shrink from the left:\n\n```\nleft = 0\nfor right in range(n):\n    add arr[right] to window\n    while window invalid:\n        remove arr[left] from window\n        left++\n    update answer with (right - left + 1)\n```\n\n**Examples:** Longest Substring Without Repeating Characters, Minimum Window Substring, Longest Repeating Character Replacement.',
      },
      {
        heading: 'Tips for Sliding Window Problems',
        content:
          '1. **Identify the constraint** — what makes the window valid/invalid?\n2. Use a **hash map or array** to track the window state (character counts, sum, etc.).\n3. Always update the answer **after** adjusting the window — decide if you want the max or min window.\n4. Sliding window is often combined with **two pointers** — they are complementary techniques.',
      },
    ],
    complexity: {
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(k)',
    },
    resources: [
      {
        type: 'video',
        title: 'Sliding Window Technique — NeetCode',
        url: 'https://www.youtube.com/watch?v=1pkOgXD63yU',
        youtubeId: '1pkOgXD63yU',
      },
      {
        type: 'video',
        title: 'Sliding Window Algorithm (Back To Back SWE)',
        url: 'https://www.youtube.com/watch?v=MK-NZ4hN7rs',
        youtubeId: 'MK-NZ4hN7rs',
      },
      {
        type: 'link',
        title: 'LeetCode Explore — Sliding Window',
        url: 'https://leetcode.com/tag/sliding-window/',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Sorting (see sub-array techniques)',
        url: 'https://visualgo.net/en/sorting',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Linked Lists                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    icon: '🔗',
    tagline: 'Dynamic data structures with pointer magic',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Singly-linked-list.svg/816px-Singly-linked-list.svg.png',
    overview:
      'A linked list is a linear collection of nodes where each node points to the next. Unlike arrays, linked lists allow O(1) insertion and deletion at known positions — but random access costs O(n). Interview questions love linked lists because they test your ability to manipulate pointers carefully without losing references.',
    sections: [
      {
        heading: 'Types of Linked Lists',
        content:
          '• **Singly linked list** — each node has `val` and `next`. Traversal is one-directional.\n• **Doubly linked list** — each node also has `prev`, allowing backward traversal. Used in LRU caches.\n• **Circular linked list** — the tail\'s `next` points back to the head.',
      },
      {
        heading: 'Essential Techniques',
        content:
          '• **Dummy head node** — simplifies edge cases (empty list, insert at head) by providing a stable anchor.\n• **Fast & slow pointers** — detect cycles (Floyd\'s algorithm), find the middle node, detect the start of a cycle.\n• **Reversal** — reverse in-place by re-wiring `next` pointers: `prev = null; while curr: next = curr.next; curr.next = prev; prev = curr; curr = next`.\n• **Merge two sorted lists** — classic merge using a dummy head.\n• **Recursive thinking** — many linked list operations have elegant recursive solutions (reverse, merge, remove nth node).',
      },
      {
        heading: 'Common Pitfalls',
        content:
          '1. **Losing references** — always save `next` before re-wiring a pointer.\n2. **Off-by-one errors** — use a dummy head and draw diagrams.\n3. **Forgetting to handle null** — always check `if node is not null` before accessing `.next`.\n4. **Not considering single-node or empty lists** — test edge cases.',
      },
    ],
    complexity: {
      average: 'O(n)',
      worst: 'O(n)',
      space: 'O(n)',
    },
    resources: [
      {
        type: 'video',
        title: 'Linked List — Data Structures (mycodeschool)',
        url: 'https://www.youtube.com/watch?v=njTh_OwMljA',
        youtubeId: 'njTh_OwMljA',
      },
      {
        type: 'video',
        title: 'Reverse a Linked List (NeetCode)',
        url: 'https://www.youtube.com/watch?v=G0_I-ZF0S38',
        youtubeId: 'G0_I-ZF0S38',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Linked List Visualisation',
        url: 'https://visualgo.net/en/list',
      },
      {
        type: 'link',
        title: 'LeetCode — Linked List Problems',
        url: 'https://leetcode.com/tag/linked-list/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Trees & BSTs                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'trees',
    title: 'Trees & Binary Search Trees',
    icon: '🌳',
    tagline: 'Hierarchical structures that power search and sorting',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Binary_tree.svg/400px-Binary_tree.svg.png',
    overview:
      'Trees are hierarchical data structures consisting of nodes connected by edges. A binary tree has at most two children per node. A Binary Search Tree (BST) maintains the invariant: left child < parent < right child, enabling O(log n) search, insert, and delete in balanced trees. Trees appear in ~25% of coding interview questions.',
    sections: [
      {
        heading: 'Tree Traversals',
        content:
          'Every tree problem starts with traversal:\n\n• **In-order (Left, Root, Right)** — produces sorted output for BSTs.\n• **Pre-order (Root, Left, Right)** — useful for serialization and copying trees.\n• **Post-order (Left, Right, Root)** — useful for deletion and calculating sizes.\n• **Level-order (BFS)** — visit nodes level by level using a queue.\n\nAll DFS traversals can be implemented recursively or iteratively with a stack.',
      },
      {
        heading: 'Binary Search Trees',
        content:
          'The BST property (`left < root < right`) enables efficient searching:\n\n```\ndef search(node, target):\n    if not node: return None\n    if target == node.val: return node\n    if target < node.val: return search(node.left, target)\n    return search(node.right, target)\n```\n\n**Key operations:** Insert, delete, find min/max, find successor/predecessor, validate BST.\n\n**Balanced BSTs** (AVL, Red-Black) guarantee O(log n) height.',
      },
      {
        heading: 'Common Tree Patterns',
        content:
          '• **Max/min depth** — simple recursive DFS.\n• **Path sum** — track cumulative sums during traversal.\n• **Lowest Common Ancestor (LCA)** — recursive check if target nodes are in left/right subtrees.\n• **Serialize / Deserialize** — convert tree to string and back.\n• **Construct tree from traversals** — build from inorder + preorder/postorder arrays.',
      },
    ],
    complexity: {
      best: 'O(log n)',
      average: 'O(log n)',
      worst: 'O(n)',
      space: 'O(n)',
    },
    resources: [
      {
        type: 'video',
        title: 'Binary Tree Introduction (mycodeschool)',
        url: 'https://www.youtube.com/watch?v=TIoCCStdiFo',
        youtubeId: 'TIoCCStdiFo',
      },
      {
        type: 'video',
        title: 'Binary Search Tree — Insert & Search',
        url: 'https://www.youtube.com/watch?v=9duq7X_61wA',
        youtubeId: '9duq7X_61wA',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — BST Visualisation',
        url: 'https://visualgo.net/en/bst',
      },
      {
        type: 'link',
        title: 'LeetCode — Tree Problems',
        url: 'https://leetcode.com/tag/tree/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Graphs                                                             */
  /* ------------------------------------------------------------------ */
  {
    id: 'graphs',
    title: 'Graphs',
    icon: '🕸️',
    tagline: 'Model relationships and solve connectivity problems',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/6n-graf.svg/440px-6n-graf.svg.png',
    overview:
      'A graph is a collection of vertices (nodes) connected by edges. Graphs model networks, social connections, maps, dependencies, and much more. They can be directed or undirected, weighted or unweighted, cyclic or acyclic. Graph problems are among the hardest in interviews but also the most rewarding to master.',
    sections: [
      {
        heading: 'Graph Representations',
        content:
          '• **Adjacency list** — each vertex stores a list of its neighbors. Space-efficient for sparse graphs: O(V + E).\n• **Adjacency matrix** — V × V boolean matrix. O(1) edge lookup but O(V²) space.\n• **Edge list** — simply a list of (u, v, weight) tuples. Useful for algorithms like Kruskal\'s.\n\nMost interview problems use **adjacency lists** built from an input edge list.',
      },
      {
        heading: 'BFS & DFS',
        content:
          '**Breadth-First Search (BFS)** uses a queue to explore nodes level by level. Best for shortest-path in unweighted graphs.\n\n**Depth-First Search (DFS)** uses a stack (or recursion) to explore as deep as possible before backtracking. Best for detecting cycles, topological sort, and connected components.\n\n```\n# BFS skeleton\nqueue = [start]\nvisited = {start}\nwhile queue:\n    node = queue.pop(0)\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            visited.add(neighbor)\n            queue.append(neighbor)\n```',
      },
      {
        heading: 'Advanced Graph Algorithms',
        content:
          '• **Dijkstra\'s** — shortest path in weighted graphs with non-negative weights, O((V+E) log V) with a min-heap.\n• **Topological Sort** — order vertices in a DAG so that every edge u→v has u before v. Used for course scheduling.\n• **Union-Find (Disjoint Set)** — efficiently track connected components with near O(1) operations.\n• **Bellman-Ford** — handles negative weights, O(V·E).\n• **Minimum Spanning Tree** — Kruskal\'s (edge-sorted + Union-Find) or Prim\'s (priority queue).',
      },
      {
        heading: 'Interview Graph Patterns',
        content:
          '• **Number of Islands** — DFS/BFS flood fill on a 2D grid.\n• **Clone Graph** — BFS/DFS with a hash map of old→new nodes.\n• **Course Schedule** — topological sort to detect cycles in a directed graph.\n• **Word Ladder** — BFS shortest path through a word graph.\n• **Network Delay Time** — Dijkstra\'s for shortest path.',
      },
    ],
    complexity: {
      average: 'O(V + E)',
      worst: 'O(V + E)',
      space: 'O(V + E)',
    },
    resources: [
      {
        type: 'video',
        title: 'Graph Data Structure & Algorithms (WilliamFiset)',
        url: 'https://www.youtube.com/watch?v=gXgEDyodOJU',
        youtubeId: 'gXgEDyodOJU',
      },
      {
        type: 'video',
        title: 'BFS & DFS Visualized',
        url: 'https://www.youtube.com/watch?v=pcKY4hjDrxk',
        youtubeId: 'pcKY4hjDrxk',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Graph Traversal',
        url: 'https://visualgo.net/en/dfsbfs',
      },
      {
        type: 'link',
        title: 'LeetCode — Graph Problems',
        url: 'https://leetcode.com/tag/graph/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Dynamic Programming                                                */
  /* ------------------------------------------------------------------ */
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    icon: '🧩',
    tagline: 'Break problems into overlapping subproblems',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Fibonacci_Spiral.svg/400px-Fibonacci_Spiral.svg.png',
    overview:
      'Dynamic Programming (DP) solves complex problems by breaking them into smaller overlapping subproblems and caching results to avoid redundant computation. It\'s one of the most feared yet most tested topics in coding interviews. The key insight: if a problem has **optimal substructure** and **overlapping subproblems**, DP can solve it efficiently.',
    sections: [
      {
        heading: 'Top-Down vs. Bottom-Up',
        content:
          '**Top-Down (Memoization):** Write a recursive solution, then add a cache (hash map or array) to store results of subproblems.\n\n```\nmemo = {}\ndef dp(state):\n    if state in memo: return memo[state]\n    # base case\n    result = ... # recursive calls\n    memo[state] = result\n    return result\n```\n\n**Bottom-Up (Tabulation):** Build a table from the base cases upward, filling in solutions iteratively.\n\n```\ndp = [0] * (n + 1)\ndp[0] = base_value\nfor i in range(1, n + 1):\n    dp[i] = ... # use dp[i-1], dp[i-2], etc.\n```\n\nBoth approaches have the same time complexity; bottom-up avoids recursion stack overhead.',
      },
      {
        heading: 'The 5-Step DP Framework',
        content:
          '1. **Define the state** — what information do you need to describe a subproblem? (e.g., `dp[i]` = best answer using elements 0..i)\n2. **Define the recurrence** — how does dp[i] relate to smaller subproblems?\n3. **Identify base cases** — what are the trivial subproblems?\n4. **Determine computation order** — bottom-up: smallest states first.\n5. **Optimize space** if only the last few states are needed (rolling array).',
      },
      {
        heading: 'Classic DP Problems',
        content:
          '• **Fibonacci** — the hello-world of DP.\n• **Climbing Stairs** — how many ways to reach step n?\n• **0/1 Knapsack** — maximize value with a weight constraint.\n• **Longest Common Subsequence** — 2D DP on two strings.\n• **Coin Change** — minimum coins to make a target amount.\n• **Longest Increasing Subsequence** — O(n²) DP or O(n log n) with binary search.\n• **Edit Distance** — minimum operations to transform one string into another.',
      },
      {
        heading: 'DP Patterns',
        content:
          '• **1D DP** — state depends on previous elements (Fibonacci, House Robber).\n• **2D DP** — state depends on two dimensions (grid paths, string matching).\n• **Interval DP** — problems on contiguous ranges (matrix chain multiplication).\n• **DP on trees** — combine results from subtrees (tree diameter, house robber III).\n• **Bitmask DP** — represent subset state as a bitmask (Travelling Salesman).',
      },
    ],
    complexity: {
      average: 'O(n) to O(n²)',
      worst: 'O(n²) to O(2^n)',
      space: 'O(n) to O(n²)',
    },
    resources: [
      {
        type: 'video',
        title: 'Dynamic Programming — Full Course (freeCodeCamp)',
        url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',
        youtubeId: 'oBt53YbR9Kk',
      },
      {
        type: 'video',
        title: 'DP for Beginners (Abdul Bari)',
        url: 'https://www.youtube.com/watch?v=lVR2u9lsxl8',
        youtubeId: 'lVR2u9lsxl8',
      },
      {
        type: 'video',
        title: 'Dynamic Programming Patterns (NeetCode)',
        url: 'https://www.youtube.com/watch?v=mBNrRy2_hVs',
        youtubeId: 'mBNrRy2_hVs',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Recursion Tree / DP',
        url: 'https://visualgo.net/en/recursion',
      },
      {
        type: 'link',
        title: 'LeetCode — Dynamic Programming Problems',
        url: 'https://leetcode.com/tag/dynamic-programming/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Recursion & Backtracking                                           */
  /* ------------------------------------------------------------------ */
  {
    id: 'recursion-backtracking',
    title: 'Recursion & Backtracking',
    icon: '🔄',
    tagline: 'Explore all possibilities and prune intelligently',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sudoku_solved_by_bactracking.gif/250px-Sudoku_solved_by_bactracking.gif',
    overview:
      'Recursion breaks a problem into smaller instances of itself. Backtracking extends recursion by exploring all candidates and "backtracking" (undoing the last choice) when a constraint is violated. Together they solve combinatorial problems like generating permutations, combinations, subsets, and solving puzzles like N-Queens and Sudoku.',
    sections: [
      {
        heading: 'Recursion Fundamentals',
        content:
          'Every recursive function needs:\n1. **Base case** — the condition that stops recursion.\n2. **Recursive case** — break the problem down and call itself.\n3. **Progress toward base case** — ensure the problem shrinks each call.\n\n```\ndef factorial(n):\n    if n <= 1: return 1        # base case\n    return n * factorial(n - 1)  # recursive case\n```\n\n**Visualize recursion** as a tree — each call is a node, and each branch is a recursive call.',
      },
      {
        heading: 'Backtracking Template',
        content:
          '```\ndef backtrack(state, choices):\n    if is_solution(state):\n        record(state)\n        return\n    for choice in choices:\n        if is_valid(choice, state):\n            make(choice)       # choose\n            backtrack(state, remaining_choices)\n            undo(choice)       # un-choose (backtrack)\n```\n\nThe key insight: **try → recurse → undo**. This explores the entire solution space while pruning invalid branches early.',
      },
      {
        heading: 'Classic Backtracking Problems',
        content:
          '• **Subsets** — generate all 2^n subsets of a set.\n• **Permutations** — generate all n! orderings.\n• **Combinations** — choose k elements from n.\n• **N-Queens** — place N queens on an N×N board with no conflicts.\n• **Sudoku Solver** — fill a 9×9 grid satisfying row, column, and box constraints.\n• **Word Search** — find a word in a 2D grid by exploring adjacent cells.',
      },
    ],
    complexity: {
      average: 'O(2^n) or O(n!)',
      worst: 'O(2^n) or O(n!)',
      space: 'O(n) recursion depth',
    },
    resources: [
      {
        type: 'video',
        title: 'Recursion Explained (Reducible)',
        url: 'https://www.youtube.com/watch?v=IJDJ0kBx2LM',
        youtubeId: 'IJDJ0kBx2LM',
      },
      {
        type: 'video',
        title: 'Backtracking (NeetCode)',
        url: 'https://www.youtube.com/watch?v=pfiQ_PS1g8E',
        youtubeId: 'pfiQ_PS1g8E',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Recursion Tree',
        url: 'https://visualgo.net/en/recursion',
      },
      {
        type: 'link',
        title: 'LeetCode — Backtracking Problems',
        url: 'https://leetcode.com/tag/backtracking/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Sorting & Searching                                                */
  /* ------------------------------------------------------------------ */
  {
    id: 'sorting-searching',
    title: 'Sorting & Searching',
    icon: '🔍',
    tagline: 'The algorithms that power efficient data processing',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Sorting_quicksort_anim.gif/250px-Sorting_quicksort_anim.gif',
    overview:
      'Sorting organizes data to enable efficient search, merging, and problem-solving. Binary search is the most powerful search technique, reducing O(n) linear scan to O(log n). Understanding when and how to apply sorting + binary search is critical — many interview problems have a "sort first, then binary search" approach.',
    sections: [
      {
        heading: 'Comparison-Based Sorting',
        content:
          '| Algorithm | Best | Average | Worst | Space | Stable? |\n|-----------|------|---------|-------|-------|---------|\n| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |\n| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |\n| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |\n| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |\n\n**Merge Sort** is the go-to for interviews — it\'s stable, always O(n log n), and demonstrates divide-and-conquer.\n**Quick Sort** is fastest in practice due to cache friendliness.',
      },
      {
        heading: 'Binary Search',
        content:
          'Binary search works on **sorted** data by repeatedly halving the search space:\n\n```\ndef binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: lo = mid + 1\n        else: hi = mid - 1\n    return -1  # not found\n```\n\n**Variations:** Find first/last occurrence, search in rotated array, find peak element, binary search on answer (min/max optimization).',
      },
      {
        heading: 'Binary Search on Answer',
        content:
          'A powerful pattern: when the answer has a monotonic property (all values ≤ k work, all > k don\'t), binary search on the answer space:\n\n1. Define the search range [lo, hi] for the answer.\n2. For each mid, check if mid is a feasible answer.\n3. Narrow the range based on feasibility.\n\n**Examples:** Koko Eating Bananas, Split Array Largest Sum, Capacity to Ship Packages.',
      },
    ],
    complexity: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
      space: 'O(n)',
    },
    resources: [
      {
        type: 'video',
        title: 'Sorting Algorithms Visualized (Timo Bingmann)',
        url: 'https://www.youtube.com/watch?v=kPRA0W1kECg',
        youtubeId: 'kPRA0W1kECg',
      },
      {
        type: 'video',
        title: 'Binary Search Algorithm (mycodeschool)',
        url: 'https://www.youtube.com/watch?v=JQhciTuD3E8',
        youtubeId: 'JQhciTuD3E8',
      },
      {
        type: 'video',
        title: 'Merge Sort Explained (Abdul Bari)',
        url: 'https://www.youtube.com/watch?v=JSceec-wEyw',
        youtubeId: 'JSceec-wEyw',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Sorting Visualisation',
        url: 'https://visualgo.net/en/sorting',
      },
      {
        type: 'link',
        title: 'LeetCode — Binary Search Problems',
        url: 'https://leetcode.com/tag/binary-search/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Stacks & Queues                                                    */
  /* ------------------------------------------------------------------ */
  {
    id: 'stacks-queues',
    title: 'Stacks & Queues',
    icon: '📚',
    tagline: 'LIFO and FIFO structures for elegant solutions',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lifo_stack.svg/350px-Lifo_stack.svg.png',
    overview:
      'A **stack** follows Last-In-First-Out (LIFO): the last element pushed is the first popped. A **queue** follows First-In-First-Out (FIFO): the first element enqueued is the first dequeued. These simple structures are the backbone of expression parsing, BFS, undo systems, and many clever interview patterns like monotonic stacks.',
    sections: [
      {
        heading: 'Stack Operations & Use Cases',
        content:
          '**Operations:** `push(x)`, `pop()`, `peek()` — all O(1).\n\n**Use cases:**\n• **Balanced parentheses** — push opening brackets, pop and match on closing.\n• **Expression evaluation** — convert infix to postfix, then evaluate.\n• **Function call stack** — every recursion uses the system stack.\n• **Undo/Redo** — push actions to a stack to reverse them.\n• **Monotonic stack** — maintain a stack of increasing/decreasing elements for "next greater/smaller element" problems.',
      },
      {
        heading: 'Queue Operations & Use Cases',
        content:
          '**Operations:** `enqueue(x)`, `dequeue()`, `front()` — all O(1) with linked list or circular buffer.\n\n**Use cases:**\n• **BFS** — the queue holds nodes to visit next.\n• **Sliding window maximum** — use a deque (double-ended queue) to track max in O(1).\n• **Task scheduling** — process tasks in order.\n• **Producer-consumer** — buffer between producers and consumers.',
      },
      {
        heading: 'Monotonic Stack Pattern',
        content:
          'A monotonic stack is a stack that maintains elements in sorted order (increasing or decreasing). It\'s used to solve "next greater/smaller element" problems in O(n):\n\n```\nresult = [-1] * n\nstack = []\nfor i in range(n):\n    while stack and arr[i] > arr[stack[-1]]:\n        result[stack.pop()] = arr[i]\n    stack.append(i)\n```\n\n**Examples:** Daily Temperatures, Next Greater Element, Largest Rectangle in Histogram, Trapping Rain Water.',
      },
    ],
    complexity: {
      average: 'O(1) per operation',
      worst: 'O(1) per operation',
      space: 'O(n)',
    },
    resources: [
      {
        type: 'video',
        title: 'Stacks & Queues — Data Structures (mycodeschool)',
        url: 'https://www.youtube.com/watch?v=wjI1WNcIntg',
        youtubeId: 'wjI1WNcIntg',
      },
      {
        type: 'video',
        title: 'Monotonic Stack Explained (NeetCode)',
        url: 'https://www.youtube.com/watch?v=cTBiBSnjO3c',
        youtubeId: 'cTBiBSnjO3c',
      },
      {
        type: 'visualizer',
        title: 'VisuAlgo — Stack & Queue',
        url: 'https://visualgo.net/en/list',
      },
      {
        type: 'link',
        title: 'LeetCode — Stack Problems',
        url: 'https://leetcode.com/tag/stack/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  Math & Logic                                                       */
  /* ------------------------------------------------------------------ */
  {
    id: 'math-logic',
    title: 'Math & Logic',
    icon: '🔢',
    tagline: 'Number theory, bit manipulation, and logical reasoning',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Sieve_of_Eratosthenes_animation.gif/350px-Sieve_of_Eratosthenes_animation.gif',
    overview:
      'Math and logic problems test your ability to recognize patterns, apply number theory, use modular arithmetic, and think in bits. While they may seem disconnected from "data structures," they appear frequently in interviews. Bit manipulation, GCD/LCM, prime sieve, combinatorics, and probability are all fair game.',
    sections: [
      {
        heading: 'Bit Manipulation',
        content:
          'Computers work in binary, and bit manipulation provides elegant O(1) operations:\n\n• `x & 1` — check if odd\n• `x >> 1` — divide by 2\n• `x << 1` — multiply by 2\n• `x & (x - 1)` — clear the lowest set bit (count set bits)\n• `x ^ x = 0` — XOR with self is zero (find the single number)\n• `a ^ b ^ a = b` — XOR is self-inverse\n\n**Problems:** Single Number, Power of Two, Counting Bits, Reverse Bits.',
      },
      {
        heading: 'Number Theory Essentials',
        content:
          '• **GCD** — Euclidean algorithm: `gcd(a, b) = gcd(b, a % b)`, base case `gcd(a, 0) = a`.\n• **LCM** — `lcm(a, b) = a * b / gcd(a, b)`.\n• **Sieve of Eratosthenes** — find all primes up to n in O(n log log n).\n• **Modular arithmetic** — `(a + b) % m = ((a % m) + (b % m)) % m`.\n• **Fast exponentiation** — compute a^n mod m in O(log n).',
      },
      {
        heading: 'Combinatorics & Probability',
        content:
          '• **Combinations** — C(n, k) = n! / (k! × (n-k)!) — use Pascal\'s triangle or DP.\n• **Permutations** — P(n, k) = n! / (n-k)!\n• **Inclusion-exclusion** — count elements in the union of sets.\n• **Expected value** — weighted average of outcomes.\n• **Reservoir sampling** — randomly pick k items from a stream of unknown size.',
      },
    ],
    complexity: {
      average: 'Varies',
      worst: 'Varies',
      space: 'O(1) to O(n)',
    },
    resources: [
      {
        type: 'video',
        title: 'Bit Manipulation for Beginners',
        url: 'https://www.youtube.com/watch?v=7jkIUgLC29I',
        youtubeId: '7jkIUgLC29I',
      },
      {
        type: 'video',
        title: 'Sieve of Eratosthenes Visualized',
        url: 'https://www.youtube.com/watch?v=pKvGYOnO9Ao',
        youtubeId: 'pKvGYOnO9Ao',
      },
      {
        type: 'visualizer',
        title: 'See Algorithms — Math Visualizations',
        url: 'https://see-algorithms.com',
      },
      {
        type: 'link',
        title: 'LeetCode — Math Problems',
        url: 'https://leetcode.com/tag/math/',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  /*  System Design                                                      */
  /* ------------------------------------------------------------------ */
  {
    id: 'system-design',
    title: 'System Design',
    icon: '🏗️',
    tagline: 'Architect scalable systems from scratch',
    heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Above_Gotham.jpg/640px-Above_Gotham.jpg',
    overview:
      'System design interviews test your ability to design large-scale distributed systems. Unlike algorithmic interviews, there\'s no single "correct" answer — interviewers evaluate your thought process, trade-off analysis, and ability to communicate clearly. This topic is especially important for senior and mid-level positions.',
    sections: [
      {
        heading: 'The System Design Framework',
        content:
          '1. **Clarify requirements** — functional (what does it do?) and non-functional (scale, latency, availability).\n2. **Estimate scale** — users, QPS, storage, bandwidth.\n3. **High-level design** — draw the major components (clients, load balancers, application servers, databases, caches).\n4. **Deep dive** — pick 2–3 components and design them in detail.\n5. **Address bottlenecks** — identify single points of failure, scalability limits, and propose solutions.',
      },
      {
        heading: 'Key Building Blocks',
        content:
          '• **Load Balancers** — distribute traffic (Round Robin, Least Connections, Consistent Hashing).\n• **Databases** — SQL (ACID, joins, normalization) vs. NoSQL (eventual consistency, horizontal scaling).\n• **Caching** — Redis/Memcached for read-heavy workloads. Cache invalidation strategies (TTL, write-through, write-behind).\n• **Message Queues** — Kafka, RabbitMQ for async processing and decoupling.\n• **CDNs** — serve static content from edge servers close to users.\n• **API Gateway** — rate limiting, authentication, routing.',
      },
      {
        heading: 'Classic System Design Problems',
        content:
          '• **Design a URL Shortener** — hashing, key generation, database design.\n• **Design Twitter/News Feed** — fan-out on write vs. fan-out on read.\n• **Design a Chat System** — WebSockets, message storage, presence.\n• **Design a Rate Limiter** — token bucket, sliding window algorithms.\n• **Design a Distributed Cache** — consistent hashing, replication, eviction.\n• **Design YouTube** — video upload, transcoding, CDN delivery, recommendation.',
      },
    ],
    complexity: {
      average: 'N/A (design-focused)',
      worst: 'N/A',
      space: 'N/A',
    },
    resources: [
      {
        type: 'video',
        title: 'System Design Interview — Step By Step Guide',
        url: 'https://www.youtube.com/watch?v=bUHFg8CZFws',
        youtubeId: 'bUHFg8CZFws',
      },
      {
        type: 'video',
        title: 'System Design for Beginners (NeetCode)',
        url: 'https://www.youtube.com/watch?v=lX4CjIFCQ00',
        youtubeId: 'lX4CjIFCQ00',
      },
      {
        type: 'link',
        title: 'System Design Primer (GitHub)',
        url: 'https://github.com/donnemartin/system-design-primer',
      },
      {
        type: 'link',
        title: 'NeetCode — System Design Roadmap',
        url: 'https://neetcode.io/roadmap',
      },
    ],
  },
];

export const articleMap = new Map(articles.map((a) => [a.id, a]));
