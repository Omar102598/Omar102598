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
      'Arrays are the most fundamental data structure in computer science — a contiguous block of memory that stores elements of the same type, accessible by index in O(1) time. Strings are essentially arrays of characters with additional operations for pattern matching and manipulation. Mastering array and string manipulation is essential because the overwhelming majority of interview questions either directly use arrays or build on techniques that originate from array traversal patterns. In this deep-dive, we will explore how arrays work at the hardware level, study their memory layout, walk through essential algorithms with code in four languages, trace through worked examples step by step, and survey the most common interview problems you will encounter.',
    sections: [
      {
        heading: 'How Arrays Work in Memory',
        content:
          'An array allocates a **contiguous block of memory**. Each element occupies the same number of bytes, so accessing element `i` is as simple as computing `base_address + i * element_size`. This gives **O(1)** random access — the key advantage arrays hold over linked lists.\n\n### Memory Layout\n\nConsider an array of 32-bit integers starting at memory address `0x1000`:\n\n| Index | Address  | Value |\n|-------|----------|-------|\n| 0     | 0x1000   | 10    |\n| 1     | 0x1004   | 20    |\n| 2     | 0x1008   | 30    |\n| 3     | 0x100C   | 40    |\n\nTo access `arr[2]`, the CPU computes `0x1000 + 2 * 4 = 0x1008` and reads 4 bytes — a single memory operation regardless of the array\'s size.\n\n### Cache Friendliness\n\nBecause elements are stored contiguously, iterating through an array benefits enormously from **CPU cache prefetching**. When you access `arr[0]`, the CPU loads an entire cache line (typically 64 bytes) into L1 cache, so `arr[1]` through `arr[15]` (for 4-byte integers) are already in cache. This is why array iteration is dramatically faster than traversing a linked list whose nodes are scattered across the heap.\n\n### Static vs. Dynamic Arrays\n\n- **Static arrays** (C/C++ `int arr[100]`) have a fixed size determined at compile time. They live on the stack and are extremely fast.\n- **Dynamic arrays** (`std::vector`, Java `ArrayList`, Python `list`, JavaScript `Array`) can grow. They maintain a **capacity** that is larger than their **size**. When size exceeds capacity, the array allocates a new block (typically 2× larger), copies all elements, and frees the old block. This means:\n  - **Amortized O(1)** append — most appends are O(1), but occasional resizes cost O(n).\n  - **O(n)** insertion/deletion in the middle — all subsequent elements must shift.\n\n### Strings as Character Arrays\n\nIn most languages, a string is an array of characters with some extra behaviour:\n- **C/C++**: Null-terminated `char` arrays (`\"hello\\0\"`).\n- **Java/C#**: Immutable `char[]` wrapped in a `String` object (backed by UTF-16).\n- **Python**: Immutable sequence of Unicode code points.\n- **JavaScript**: Immutable UTF-16 string primitives.\n\nBecause strings are immutable in Java, Python, and JS, **repeated concatenation creates O(n) new objects** per operation, leading to O(n²) total work. Always use `StringBuilder` (Java), `list.join()` (Python), or `Array.join()` (JS) for building strings incrementally.',
      },
      {
        heading: 'Core Array Operations & Their Complexities',
        content:
          '| Operation | Time Complexity | Notes |\n|-----------|----------------|-------|\n| Access by index | O(1) | Direct address calculation |\n| Search (unsorted) | O(n) | Must scan all elements |\n| Search (sorted) | O(log n) | Binary search |\n| Insert at end | O(1) amortized | May trigger resize |\n| Insert at index i | O(n) | Shift elements right |\n| Delete at index i | O(n) | Shift elements left |\n| Append | O(1) amortized | Dynamic arrays |\n\n### Array Declaration in Four Languages\n\n```python\n# Python — dynamic list\narr = [1, 2, 3, 4, 5]\narr.append(6)          # O(1) amortized\narr.insert(2, 99)      # O(n) — shifts elements\narr.pop()              # O(1) — remove last\narr.pop(0)             # O(n) — remove first, shifts all\n```\n\n```java\n// Java — ArrayList (dynamic) vs int[] (static)\nimport java.util.ArrayList;\n\nint[] staticArr = {1, 2, 3, 4, 5};\nArrayList<Integer> dynamicArr = new ArrayList<>();\ndynamicArr.add(6);         // O(1) amortized\ndynamicArr.add(2, 99);     // O(n)\ndynamicArr.remove(dynamicArr.size() - 1); // O(1)\n```\n\n```javascript\n// JavaScript — dynamic array\nconst arr = [1, 2, 3, 4, 5];\narr.push(6);            // O(1) amortized\narr.splice(2, 0, 99);   // O(n) — insert at index 2\narr.pop();              // O(1)\narr.shift();            // O(n) — remove first\n```\n\n```cpp\n// C++ — std::vector (dynamic)\n#include <vector>\nusing namespace std;\n\nvector<int> arr = {1, 2, 3, 4, 5};\narr.push_back(6);                    // O(1) amortized\narr.insert(arr.begin() + 2, 99);     // O(n)\narr.pop_back();                      // O(1)\narr.erase(arr.begin());              // O(n)\n```',
      },
      {
        heading: 'Essential Array Algorithms',
        content:
          '### Prefix Sums\n\nA prefix sum array allows you to answer **range sum queries** in O(1) after O(n) preprocessing.\n\n```python\n# Python — Prefix Sum\ndef build_prefix(arr):\n    prefix = [0] * (len(arr) + 1)\n    for i in range(len(arr)):\n        prefix[i + 1] = prefix[i] + arr[i]\n    return prefix\n\ndef range_sum(prefix, left, right):\n    return prefix[right + 1] - prefix[left]\n\narr = [3, 1, 4, 1, 5, 9]\nprefix = build_prefix(arr)\nprint(range_sum(prefix, 1, 3))  # sum of arr[1..3] = 1+4+1 = 6\n```\n\n```java\n// Java — Prefix Sum\nint[] buildPrefix(int[] arr) {\n    int[] prefix = new int[arr.length + 1];\n    for (int i = 0; i < arr.length; i++) {\n        prefix[i + 1] = prefix[i] + arr[i];\n    }\n    return prefix;\n}\n\nint rangeSum(int[] prefix, int left, int right) {\n    return prefix[right + 1] - prefix[left];\n}\n```\n\n```javascript\n// JavaScript — Prefix Sum\nfunction buildPrefix(arr) {\n    const prefix = new Array(arr.length + 1).fill(0);\n    for (let i = 0; i < arr.length; i++) {\n        prefix[i + 1] = prefix[i] + arr[i];\n    }\n    return prefix;\n}\n\nfunction rangeSum(prefix, left, right) {\n    return prefix[right + 1] - prefix[left];\n}\n```\n\n```cpp\n// C++ — Prefix Sum\nvector<int> buildPrefix(const vector<int>& arr) {\n    vector<int> prefix(arr.size() + 1, 0);\n    for (int i = 0; i < (int)arr.size(); i++) {\n        prefix[i + 1] = prefix[i] + arr[i];\n    }\n    return prefix;\n}\n\nint rangeSum(const vector<int>& prefix, int left, int right) {\n    return prefix[right + 1] - prefix[left];\n}\n```\n\n### Kadane\\\'s Algorithm (Maximum Subarray Sum)\n\nFinds the contiguous subarray with the largest sum in **O(n)** time and **O(1)** space.\n\n```python\n# Python — Kadane\\\'s Algorithm\ndef max_subarray(nums):\n    max_sum = current = nums[0]\n    for num in nums[1:]:\n        current = max(num, current + num)\n        max_sum = max(max_sum, current)\n    return max_sum\n\nprint(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # 6\n```\n\n```java\n// Java — Kadane\\\'s Algorithm\nint maxSubarray(int[] nums) {\n    int maxSum = nums[0], current = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        current = Math.max(nums[i], current + nums[i]);\n        maxSum = Math.max(maxSum, current);\n    }\n    return maxSum;\n}\n```\n\n```javascript\n// JavaScript — Kadane\\\'s Algorithm\nfunction maxSubarray(nums) {\n    let maxSum = nums[0], current = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        current = Math.max(nums[i], current + nums[i]);\n        maxSum = Math.max(maxSum, current);\n    }\n    return maxSum;\n}\n```\n\n```cpp\n// C++ — Kadane\\\'s Algorithm\nint maxSubarray(vector<int>& nums) {\n    int maxSum = nums[0], current = nums[0];\n    for (int i = 1; i < (int)nums.size(); i++) {\n        current = max(nums[i], current + nums[i]);\n        maxSum = max(maxSum, current);\n    }\n    return maxSum;\n}\n```\n\n### Dutch National Flag (3-Way Partition)\n\nPartitions an array into three sections in a single pass — O(n) time, O(1) space. Used in problems like **Sort Colors** (LeetCode 75).\n\n```python\n# Python — Dutch National Flag\ndef sort_colors(nums):\n    lo, mid, hi = 0, 0, len(nums) - 1\n    while mid <= hi:\n        if nums[mid] == 0:\n            nums[lo], nums[mid] = nums[mid], nums[lo]\n            lo += 1\n            mid += 1\n        elif nums[mid] == 1:\n            mid += 1\n        else:\n            nums[mid], nums[hi] = nums[hi], nums[mid]\n            hi -= 1\n```',
      },
      {
        heading: 'Worked Example: Kadane\\\'s Algorithm Step by Step',
        content:
          'Let\\\'s trace Kadane\\\'s algorithm on `nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]`.\n\nWe maintain two variables: `current` (the maximum subarray ending at the current position) and `max_sum` (the global maximum found so far).\n\n| Step | Index | nums[i] | current = max(nums[i], current + nums[i]) | max_sum = max(max_sum, current) |\n|------|-------|---------|-------------------------------------------|----------------------------------|\n| Init | 0     | -2      | -2                                        | -2                               |\n| 1    | 1     | 1       | max(1, -2+1) = max(1, -1) = **1**         | max(-2, 1) = **1**               |\n| 2    | 2     | -3      | max(-3, 1+(-3)) = max(-3, -2) = **-2**    | max(1, -2) = **1**               |\n| 3    | 3     | 4       | max(4, -2+4) = max(4, 2) = **4**          | max(1, 4) = **4**                |\n| 4    | 4     | -1      | max(-1, 4+(-1)) = max(-1, 3) = **3**      | max(4, 3) = **4**                |\n| 5    | 5     | 2       | max(2, 3+2) = max(2, 5) = **5**           | max(4, 5) = **5**                |\n| 6    | 6     | 1       | max(1, 5+1) = max(1, 6) = **6**           | max(5, 6) = **6**                |\n| 7    | 7     | -5      | max(-5, 6+(-5)) = max(-5, 1) = **1**      | max(6, 1) = **6**                |\n| 8    | 8     | 4       | max(4, 1+4) = max(4, 5) = **5**           | max(6, 5) = **6**                |\n\n**Result:** The maximum subarray sum is **6**, corresponding to the subarray `[4, -1, 2, 1]` (indices 3–6).\n\n### Key Insight\n\nAt each step, we decide: should we **extend** the previous subarray by including `nums[i]`, or **start fresh** from `nums[i]`? If `current + nums[i] < nums[i]`, the previous subarray is \"dragging us down,\" so we start a new subarray.',
      },
      {
        heading: 'String-Specific Patterns & Algorithms',
        content:
          '### Palindrome Checking with Two Pointers\n\n```python\n# Python — Valid Palindrome (ignoring non-alphanumeric)\ndef is_palindrome(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        while left < right and not s[left].isalnum():\n            left += 1\n        while left < right and not s[right].isalnum():\n            right -= 1\n        if s[left].lower() != s[right].lower():\n            return False\n        left += 1\n        right -= 1\n    return True\n```\n\n```java\n// Java — Valid Palindrome\nboolean isPalindrome(String s) {\n    int left = 0, right = s.length() - 1;\n    while (left < right) {\n        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;\n        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;\n        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right)))\n            return false;\n        left++;\n        right--;\n    }\n    return true;\n}\n```\n\n### Anagram Detection\n\nTwo strings are anagrams if they have the same character frequencies. Use a frequency array of size 26 for lowercase English letters:\n\n```python\n# Python — Anagram Check\ndef is_anagram(s, t):\n    if len(s) != len(t):\n        return False\n    count = [0] * 26\n    for i in range(len(s)):\n        count[ord(s[i]) - ord(\\\'a\\\')] += 1\n        count[ord(t[i]) - ord(\\\'a\\\')] -= 1\n    return all(c == 0 for c in count)\n```\n\n```cpp\n// C++ — Anagram Check\nbool isAnagram(string s, string t) {\n    if (s.size() != t.size()) return false;\n    int count[26] = {0};\n    for (int i = 0; i < (int)s.size(); i++) {\n        count[s[i] - \\\'a\\\']++;\n        count[t[i] - \\\'a\\\']--;\n    }\n    for (int c : count) if (c != 0) return false;\n    return true;\n}\n```\n\n### String Building — Avoid O(n²) Concatenation\n\n```python\n# BAD — O(n^2) in Python due to immutable strings\nresult = \"\"\nfor ch in some_list:\n    result += ch  # Creates a new string each time!\n\n# GOOD — O(n) using join\nresult = \"\".join(some_list)\n```\n\n```java\n// BAD — O(n^2) with String concatenation\nString result = \"\";\nfor (char ch : arr) {\n    result += ch;  // Creates new String object each time!\n}\n\n// GOOD — O(n) with StringBuilder\nStringBuilder sb = new StringBuilder();\nfor (char ch : arr) {\n    sb.append(ch);\n}\nString result = sb.toString();\n```\n\n### Substring Search: KMP Algorithm (Brief Overview)\n\nThe KMP algorithm preprocesses the pattern to build a **failure function** (longest proper prefix which is also a suffix), enabling O(n + m) substring search vs. O(n * m) brute force. Essential to know conceptually for interviews, though you rarely need to code it from scratch.',
      },
      {
        heading: 'Worked Example: Prefix Sum Range Queries',
        content:
          'Given `arr = [2, 4, 6, 8, 10]`, build the prefix sum and answer range queries.\n\n**Step 1: Build the prefix array**\n\n| i         | 0 | 1 | 2  | 3  | 4  | 5  |\n|-----------|---|---|----|----|----|----|----|\n| prefix[i] | 0 | 2 | 6  | 12 | 20 | 30 |\n\n- `prefix[0] = 0` (sentinel)\n- `prefix[1] = prefix[0] + arr[0] = 0 + 2 = 2`\n- `prefix[2] = prefix[1] + arr[1] = 2 + 4 = 6`\n- `prefix[3] = prefix[2] + arr[2] = 6 + 6 = 12`\n- `prefix[4] = prefix[3] + arr[3] = 12 + 8 = 20`\n- `prefix[5] = prefix[4] + arr[4] = 20 + 10 = 30`\n\n**Step 2: Answer queries in O(1)**\n\n- **Sum of arr[1..3]** (elements 4, 6, 8) = `prefix[4] - prefix[1] = 20 - 2 = 18` ✓\n- **Sum of arr[0..4]** (entire array) = `prefix[5] - prefix[0] = 30 - 0 = 30` ✓\n- **Sum of arr[2..2]** (just element 6) = `prefix[3] - prefix[2] = 12 - 6 = 6` ✓\n\n### Why This Matters\n\nWithout prefix sums, each range query costs O(n). With prefix sums, after O(n) preprocessing, each query is O(1). This is critical in problems like **Subarray Sum Equals K** (LeetCode 560), where you combine prefix sums with a hash map.',
      },
      {
        heading: 'Common Interview Problems & Solution Approaches',
        content:
          '### Easy\n- **Two Sum** (LeetCode 1) — Hash map storing complements. O(n) time, O(n) space.\n- **Best Time to Buy and Sell Stock** (LeetCode 121) — Track running minimum, compute max profit. O(n).\n- **Valid Anagram** (LeetCode 242) — Frequency counting with array of size 26. O(n).\n- **Merge Sorted Array** (LeetCode 88) — Three pointers starting from the end. O(n + m).\n\n### Medium\n- **Product of Array Except Self** (LeetCode 238) — Two-pass prefix/suffix product. O(n) time, O(1) extra space.\n- **Maximum Subarray** (LeetCode 53) — Kadane\\\'s algorithm. O(n).\n- **3Sum** (LeetCode 15) — Sort + two pointers for each element. O(n²).\n- **Group Anagrams** (LeetCode 49) — Hash map with sorted string or frequency tuple as key. O(n * k log k).\n- **Longest Substring Without Repeating Characters** (LeetCode 3) — Sliding window with hash set. O(n).\n\n### Hard\n- **Trapping Rain Water** (LeetCode 42) — Two pointers or prefix max arrays. O(n).\n- **Minimum Window Substring** (LeetCode 76) — Sliding window with two frequency maps. O(n).\n- **First Missing Positive** (LeetCode 41) — Cyclic sort: place each number at its correct index. O(n) time, O(1) space.\n\n### Interview Tips\n\n1. Always clarify whether the array is **sorted** — it unlocks binary search and two-pointer patterns.\n2. Ask about **duplicates** and **negative numbers**; they change the approach dramatically.\n3. Consider **in-place** vs. **extra-space** trade-offs — interviewers love O(1) space solutions.\n4. For strings, ask about the **character set** (ASCII 128 vs. extended 256 vs. Unicode) to size your frequency array.\n5. When stuck, think about whether a **hash map**, **sorting**, or **prefix sum** can reduce the complexity.',
      },
      {
        heading: 'Time & Space Complexity Cheat Sheet',
        content:
          '| Operation | Array | Dynamic Array (amortized) | String (immutable) |\n|-----------|-------|---------------------------|--------------------|\n| Access | O(1) | O(1) | O(1) |\n| Search | O(n) | O(n) | O(n) |\n| Insert at end | — | O(1) | O(n)* |\n| Insert at i | O(n) | O(n) | O(n)* |\n| Delete at i | O(n) | O(n) | O(n)* |\n| Concatenation | — | O(n) | O(n + m)* |\n\n\\* Immutable strings create a new copy.\n\n### Space Complexity\n\n- Storing n elements: **O(n)**\n- Dynamic arrays may allocate up to **2n** capacity due to doubling strategy\n- Prefix sum array adds **O(n)** extra space\n- In-place algorithms like Kadane\\\'s use **O(1)** extra space\n\n### When to Use Arrays vs. Other Structures\n\n- **Need O(1) access by index** → Array\n- **Need O(1) search by value** → Hash Set\n- **Need sorted order + fast insert** → Balanced BST or sorted array + binary search\n- **Need O(1) insert/delete at both ends** → Deque\n- **Need O(1) insert/delete at arbitrary positions** → Linked List (if you have a reference)',
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
      'A hash map (also called a dictionary or associative array) stores key–value pairs and provides average O(1) insert, delete, and lookup — making it one of the most powerful and frequently used data structures in all of programming. Under the hood, it uses a hash function to map keys to array indices, with collision resolution strategies to handle inevitable conflicts. Hash sets are the same structure but store only keys (no values). These structures are absolute interview gold — the famous "Two Sum" problem is solved elegantly with a single hash map pass, and hash maps appear in the optimal solution of countless other problems. In this article we will dissect how hashing works internally, build hash tables from scratch, study collision resolution in depth, and master the interview patterns that rely on hash-based data structures.',
    sections: [
      {
        heading: 'How Hashing Works Internally',
        content:
          'A hash table consists of an **array of buckets** and a **hash function** that converts a key into an array index.\n\n### The Hash Function\n\nA hash function takes an arbitrary key and produces an integer. A good hash function has three properties:\n1. **Deterministic** — the same key always produces the same hash.\n2. **Uniform distribution** — keys spread evenly across buckets to minimize collisions.\n3. **Efficient** — O(1) to compute for fixed-size keys.\n\nThe index is computed as: `index = hash(key) % capacity`\n\n### Memory Layout\n\nA hash map with capacity 8:\n\n```\nBucket  |  0  |  1  |  2  |  3  |  4  |  5  |  6  |  7  |\n        |     |     |     |     |     |     |     |     |\n        | null| K:V | null| K:V | K:V | null| null| K:V |\n              |           |   |                     |\n              v           v   v                     v\n           (\"cat\",3)  (\"dog\",5) (\"bat\",7)       (\"fox\",2)\n                          |\n                          v\n                       (\"ant\",1)  <- chained collision\n```\n\n### The Load Factor\n\nThe **load factor** α = n / capacity (where n = number of stored entries). When α exceeds a threshold (typically **0.75** in Java, **2/3** in Python), the table **resizes**:\n1. Allocate a new array with 2× capacity.\n2. Rehash every entry (recompute index for new capacity).\n3. Free the old array.\n\nRehashing costs O(n) but happens infrequently, so insertion remains **amortized O(1)**.\n\n### Language Implementations\n\n| Language | Hash Map | Hash Set | Notes |\n|----------|----------|----------|-------|\n| Python | `dict` | `set` | Insertion-ordered since 3.7, open addressing |\n| Java | `HashMap` | `HashSet` | Chaining with linked lists (→ trees at 8+) |\n| JavaScript | `Map` / `{}` | `Set` | `Map` preserves insertion order |\n| C++ | `unordered_map` | `unordered_set` | Chaining by default |',
      },
      {
        heading: 'Collision Resolution Strategies',
        content:
          'When two keys hash to the same index, we have a **collision**. There are two major strategies:\n\n### 1. Separate Chaining\n\nEach bucket holds a **linked list** (or another collection) of all entries that hash to that index.\n\n- **Insert**: Hash the key, append to the bucket\\\'s list. O(1).\n- **Search**: Hash the key, traverse the bucket\\\'s list. O(1) average, O(n) worst case.\n- **Delete**: Hash the key, find and remove from the list. O(1) average.\n\n**Pros:** Simple to implement, gracefully handles high load factors.\n**Cons:** Extra memory for linked list pointers; poor cache locality.\n\nJava\\\'s `HashMap` uses chaining, and when a bucket exceeds 8 entries, it converts the linked list to a **red-black tree** for O(log n) worst-case lookup.\n\n### 2. Open Addressing\n\nAll entries live directly in the bucket array. When a collision occurs, **probe** for the next available slot:\n\n- **Linear probing**: Check index+1, index+2, index+3, ...\n- **Quadratic probing**: Check index+1², index+2², index+3², ...\n- **Double hashing**: Use a second hash function for the step size.\n\n**Pros:** Better cache locality (everything in one array); no pointer overhead.\n**Cons:** Performance degrades sharply at high load factors; deletion requires tombstone markers.\n\nPython\\\'s `dict` uses a variant of open addressing with pseudo-random probing.\n\n### Implementing a Simple Hash Map (Python)\n\n```python\nclass SimpleHashMap:\n    def __init__(self, capacity=16):\n        self.capacity = capacity\n        self.size = 0\n        self.buckets = [[] for _ in range(capacity)]\n\n    def _hash(self, key):\n        return hash(key) % self.capacity\n\n    def put(self, key, value):\n        idx = self._hash(key)\n        for i, (k, v) in enumerate(self.buckets[idx]):\n            if k == key:\n                self.buckets[idx][i] = (key, value)\n                return\n        self.buckets[idx].append((key, value))\n        self.size += 1\n        if self.size / self.capacity > 0.75:\n            self._resize()\n\n    def get(self, key):\n        idx = self._hash(key)\n        for k, v in self.buckets[idx]:\n            if k == key:\n                return v\n        return None\n\n    def _resize(self):\n        old = self.buckets\n        self.capacity *= 2\n        self.buckets = [[] for _ in range(self.capacity)]\n        self.size = 0\n        for bucket in old:\n            for key, value in bucket:\n                self.put(key, value)\n```\n\n```java\n// Java — Simplified Hash Map with Chaining\nimport java.util.LinkedList;\n\nclass SimpleHashMap<K, V> {\n    private static class Entry<K, V> {\n        K key; V value;\n        Entry(K key, V value) { this.key = key; this.value = value; }\n    }\n\n    private LinkedList<Entry<K, V>>[] buckets;\n    private int capacity = 16;\n    private int size = 0;\n\n    @SuppressWarnings(\"unchecked\")\n    SimpleHashMap() {\n        buckets = new LinkedList[capacity];\n        for (int i = 0; i < capacity; i++)\n            buckets[i] = new LinkedList<>();\n    }\n\n    private int hash(K key) {\n        return Math.abs(key.hashCode() % capacity);\n    }\n\n    void put(K key, V value) {\n        int idx = hash(key);\n        for (Entry<K, V> e : buckets[idx]) {\n            if (e.key.equals(key)) { e.value = value; return; }\n        }\n        buckets[idx].add(new Entry<>(key, value));\n        size++;\n    }\n\n    V get(K key) {\n        int idx = hash(key);\n        for (Entry<K, V> e : buckets[idx]) {\n            if (e.key.equals(key)) return e.value;\n        }\n        return null;\n    }\n}\n```',
      },
      {
        heading: 'Hash Map & Set Operations in Four Languages',
        content:
          '### Python\n\n```python\n# Dictionary (hash map)\nmap = {}\nmap[\"apple\"] = 3        # insert / update\nval = map.get(\"apple\")  # lookup — returns None if missing\nmap.get(\"pear\", 0)      # lookup with default value\n\"apple\" in map          # membership check — O(1)\ndel map[\"apple\"]        # delete\nfor key, val in map.items():  # iterate\n    print(key, val)\n\n# Set (hash set)\ns = set()\ns.add(1)                # insert\ns.discard(1)            # delete (no error if missing)\n1 in s                  # membership check — O(1)\ns1 & s2                 # intersection\ns1 | s2                 # union\ns1 - s2                 # difference\n```\n\n### Java\n\n```java\nimport java.util.*;\n\nMap<String, Integer> map = new HashMap<>();\nmap.put(\"apple\", 3);              // insert / update\nint val = map.getOrDefault(\"apple\", 0); // lookup with default\nmap.containsKey(\"apple\");         // membership — O(1)\nmap.remove(\"apple\");              // delete\nfor (Map.Entry<String, Integer> e : map.entrySet()) {\n    System.out.println(e.getKey() + \" \" + e.getValue());\n}\n\nSet<Integer> set = new HashSet<>();\nset.add(1);                       // insert\nset.remove(1);                    // delete\nset.contains(1);                  // membership — O(1)\n```\n\n### JavaScript\n\n```javascript\n// Map (preferred over plain objects for hash map use)\nconst map = new Map();\nmap.set(\"apple\", 3);          // insert / update\nmap.get(\"apple\");             // lookup — undefined if missing\nmap.has(\"apple\");             // membership — O(1)\nmap.delete(\"apple\");          // delete\nfor (const [key, val] of map) {\n    console.log(key, val);\n}\n\n// Set\nconst set = new Set();\nset.add(1);                   // insert\nset.delete(1);                // delete\nset.has(1);                   // membership — O(1)\n```\n\n### C++\n\n```cpp\n#include <unordered_map>\n#include <unordered_set>\nusing namespace std;\n\nunordered_map<string, int> map;\nmap[\"apple\"] = 3;                    // insert / update\nint val = map.count(\"apple\") ? map[\"apple\"] : 0; // lookup\nmap.count(\"apple\");                  // membership — O(1)\nmap.erase(\"apple\");                  // delete\nfor (auto& [key, val] : map) {\n    cout << key << \" \" << val << endl;\n}\n\nunordered_set<int> s;\ns.insert(1);                         // insert\ns.erase(1);                          // delete\ns.count(1);                          // membership — O(1)\n```',
      },
      {
        heading: 'Core Interview Patterns Using Hash Maps',
        content:
          '### Pattern 1: Two Sum (Complement Lookup)\n\nStore each number\\\'s index as you iterate. For each number, check if its complement exists in the map.\n\n```python\n# Python — Two Sum\ndef two_sum(nums, target):\n    seen = {}  # value -> index\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n```\n\n```java\n// Java — Two Sum\nint[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int complement = target - nums[i];\n        if (seen.containsKey(complement))\n            return new int[]{seen.get(complement), i};\n        seen.put(nums[i], i);\n    }\n    return new int[]{};\n}\n```\n\n```javascript\n// JavaScript — Two Sum\nfunction twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (seen.has(complement))\n            return [seen.get(complement), i];\n        seen.set(nums[i], i);\n    }\n    return [];\n}\n```\n\n```cpp\n// C++ — Two Sum\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < (int)nums.size(); i++) {\n        int comp = target - nums[i];\n        if (seen.count(comp))\n            return {seen[comp], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}\n```\n\n### Pattern 2: Frequency Counting\n\nCount occurrences to find duplicates, majority elements, anagrams, etc.\n\n```python\n# Python — Frequency counting\nfrom collections import Counter\n\ndef top_k_frequent(nums, k):\n    count = Counter(nums)\n    return [x for x, _ in count.most_common(k)]\n```\n\n### Pattern 3: Subarray Sum Equals K (Prefix Sum + Hash Map)\n\n```python\n# Python — Subarray Sum Equals K (LeetCode 560)\ndef subarray_sum(nums, k):\n    count = 0\n    prefix = 0\n    prefix_counts = {0: 1}  # prefix_sum -> frequency\n    for num in nums:\n        prefix += num\n        count += prefix_counts.get(prefix - k, 0)\n        prefix_counts[prefix] = prefix_counts.get(prefix, 0) + 1\n    return count\n```\n\n### Pattern 4: Group By Key\n\n```python\n# Python — Group Anagrams (LeetCode 49)\nfrom collections import defaultdict\n\ndef group_anagrams(strs):\n    groups = defaultdict(list)\n    for s in strs:\n        key = tuple(sorted(s))\n        groups[key].append(s)\n    return list(groups.values())\n```',
      },
      {
        heading: 'Worked Example: Two Sum Step by Step',
        content:
          'Given `nums = [2, 7, 11, 15]`, `target = 9`. Find two indices whose values sum to 9.\n\nWe maintain a hash map `seen` mapping each value to its index.\n\n| Step | Index | nums[i] | complement = 9 - nums[i] | complement in seen? | Action | seen |\n|------|-------|---------|--------------------------|--------------------|---------|---------|\n| 1 | 0 | 2 | 7 | No | Add 2→0 | {2: 0} |\n| 2 | 1 | 7 | 2 | **Yes! seen[2] = 0** | Return [0, 1] | — |\n\n**Result:** `[0, 1]` because `nums[0] + nums[1] = 2 + 7 = 9` ✓\n\n### A Longer Trace\n\nGiven `nums = [3, 2, 4]`, `target = 6`:\n\n| Step | Index | nums[i] | complement | in seen? | Action | seen |\n|------|-------|---------|-----------|---------|--------|---------|\n| 1 | 0 | 3 | 3 | No | Add 3→0 | {3: 0} |\n| 2 | 1 | 2 | 4 | No | Add 2→1 | {3: 0, 2: 1} |\n| 3 | 2 | 4 | 2 | **Yes! seen[2] = 1** | Return [1, 2] | — |\n\n**Result:** `[1, 2]` because `nums[1] + nums[2] = 2 + 4 = 6` ✓\n\n### Why O(n)?\n\nEach element is visited exactly once. Each hash map operation (insert and lookup) is O(1) average. So total: **O(n) time, O(n) space**. Compare this to the brute force O(n²) of checking every pair!',
      },
      {
        heading: 'Worked Example: Subarray Sum Equals K',
        content:
          'Given `nums = [1, 1, 1]`, `k = 2`. Count the number of subarrays that sum to 2.\n\nWe maintain a running prefix sum and a hash map counting how many times each prefix sum has occurred.\n\n| Step | Index | nums[i] | prefix | prefix - k | count += prefix_counts.get(prefix-k, 0) | prefix_counts |\n|------|-------|---------|--------|-----------|-------------------------------------------|---------|\n| Init | — | — | 0 | — | — | {0: 1} |\n| 1 | 0 | 1 | 1 | -1 | count += 0 → count = 0 | {0: 1, 1: 1} |\n| 2 | 1 | 1 | 2 | 0 | count += 1 → count = 1 | {0: 1, 1: 1, 2: 1} |\n| 3 | 2 | 1 | 3 | 1 | count += 1 → count = 2 | {0: 1, 1: 1, 2: 1, 3: 1} |\n\n**Result:** 2 subarrays sum to 2: `[1, 1]` (indices 0–1) and `[1, 1]` (indices 1–2).\n\n### The Key Insight\n\nIf `prefix[j] - prefix[i] = k`, then the subarray `arr[i+1..j]` sums to `k`. By storing prefix sum frequencies, we can count how many valid starting points `i` exist for each ending point `j` — all in O(1) per element.',
      },
      {
        heading: 'Common Interview Problems & Complexity Comparison',
        content:
          '### Must-Know Hash Map/Set Problems\n\n| Problem | Approach | Time | Space |\n|---------|----------|------|-------|\n| Two Sum (LC 1) | Complement lookup | O(n) | O(n) |\n| Valid Anagram (LC 242) | Frequency array | O(n) | O(1) |\n| Group Anagrams (LC 49) | Sort-key grouping | O(n·k log k) | O(n·k) |\n| Contains Duplicate (LC 217) | Hash set | O(n) | O(n) |\n| Longest Consecutive Sequence (LC 128) | Hash set + smart iteration | O(n) | O(n) |\n| Subarray Sum Equals K (LC 560) | Prefix sum + hash map | O(n) | O(n) |\n| Top K Frequent Elements (LC 347) | Counter + bucket sort | O(n) | O(n) |\n| LRU Cache (LC 146) | Hash map + doubly linked list | O(1) | O(capacity) |\n| Intersection of Two Arrays (LC 349) | Hash set intersection | O(n + m) | O(min(n,m)) |\n\n### Hash Map vs. Other Structures\n\n| Operation | Hash Map | Sorted Array | BST (balanced) | Trie |\n|-----------|----------|-------------|----------------|------|\n| Search | O(1) avg | O(log n) | O(log n) | O(L) |\n| Insert | O(1) avg | O(n) | O(log n) | O(L) |\n| Delete | O(1) avg | O(n) | O(log n) | O(L) |\n| Ordered iteration | No | Yes | Yes | Yes (lexicographic) |\n| Prefix queries | No | No | No | Yes |\n\nUse a hash map when you need **fast lookups** and **don\\\'t need ordering**. Use a `TreeMap` (Java) / `map` (C++) / `SortedDict` (Python) when you need sorted keys.\n\n### Common Pitfalls\n\n1. **Mutable keys** — Never use mutable objects (lists, sets) as hash map keys. Use tuples or frozensets instead.\n2. **Hash collisions** — Worst case is O(n) if all keys hash to the same bucket. In practice, this is rare with good hash functions.\n3. **Default values** — Use `defaultdict` (Python), `getOrDefault` (Java), or `map.count()` (C++) to handle missing keys gracefully.\n4. **Ordering assumptions** — Standard hash maps do NOT preserve insertion order in Java < 8 or C++. Use `LinkedHashMap` (Java) or `dict` (Python 3.7+) if order matters.',
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
      'The two-pointer technique uses two indices that move toward each other (or in the same direction) to solve problems in O(n) time that might otherwise require O(n²). It is one of the most elegant and efficient algorithmic patterns, especially powerful on sorted arrays and strings. Classic examples include finding pair sums, removing duplicates in-place, the container-with-most-water problem, and the three-sum problem. In this article, we will explore the two major variants of two pointers — opposite-direction and same-direction — provide full code implementations in four languages, trace through worked examples, and cover the most important interview problems that use this technique.',
    sections: [
      {
        heading: 'Why Two Pointers Work',
        content:
          'The fundamental insight behind two pointers is that we can **eliminate large portions of the search space** with each comparison, reducing O(n²) brute force to O(n).\n\n### The Core Idea\n\nConsider searching for two numbers in a **sorted** array that sum to a target. The brute-force approach checks all O(n²) pairs. But with two pointers:\n\n1. Place `left` at the start, `right` at the end.\n2. Compute `sum = arr[left] + arr[right]`.\n3. If `sum == target`, we found our answer.\n4. If `sum < target`, we need a larger sum → move `left` right.\n5. If `sum > target`, we need a smaller sum → move `right` left.\n\nEach step eliminates an entire row or column of the \"pair matrix.\" Since each pointer only moves in one direction, the total work is **O(n)**.\n\n### Prerequisites\n\nTwo pointers work best when:\n- The input is **sorted** (or can be sorted without breaking the problem).\n- There is a **monotonic relationship** — moving one pointer in a direction consistently increases or decreases a value.\n- We need to find a **pair, triplet, or subarray** satisfying a condition.\n\n### Two Main Variants\n\n1. **Opposite-direction pointers** — start from both ends, move inward.\n2. **Same-direction (fast/slow) pointers** — both start from the beginning; the fast pointer advances every step, the slow pointer advances conditionally.',
      },
      {
        heading: 'Opposite-Direction Pointers',
        content:
          'Place one pointer at index 0 and one at index n-1. Move them toward each other based on a condition.\n\n### Template\n\n```python\n# Python — Opposite-direction template\ndef two_pointer_opposite(arr, target):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        current = arr[left] + arr[right]\n        if current == target:\n            return [left, right]\n        elif current < target:\n            left += 1\n        else:\n            right -= 1\n    return [-1, -1]\n```\n\n```java\n// Java — Opposite-direction template\nint[] twoPointerOpposite(int[] arr, int target) {\n    int left = 0, right = arr.length - 1;\n    while (left < right) {\n        int current = arr[left] + arr[right];\n        if (current == target) return new int[]{left, right};\n        else if (current < target) left++;\n        else right--;\n    }\n    return new int[]{-1, -1};\n}\n```\n\n```javascript\n// JavaScript — Opposite-direction template\nfunction twoPointerOpposite(arr, target) {\n    let left = 0, right = arr.length - 1;\n    while (left < right) {\n        const current = arr[left] + arr[right];\n        if (current === target) return [left, right];\n        else if (current < target) left++;\n        else right--;\n    }\n    return [-1, -1];\n}\n```\n\n```cpp\n// C++ — Opposite-direction template\nvector<int> twoPointerOpposite(vector<int>& arr, int target) {\n    int left = 0, right = (int)arr.size() - 1;\n    while (left < right) {\n        int current = arr[left] + arr[right];\n        if (current == target) return {left, right};\n        else if (current < target) left++;\n        else right--;\n    }\n    return {-1, -1};\n}\n```\n\n### Classic Applications\n\n- **Two Sum II** (sorted input) — exactly the template above.\n- **Container With Most Water** — maximize `min(height[l], height[r]) * (r - l)`, move the shorter side inward.\n- **Valid Palindrome** — compare characters from both ends.\n- **Trapping Rain Water** — track `leftMax` and `rightMax`, process the smaller side.',
      },
      {
        heading: 'Same-Direction (Fast & Slow) Pointers',
        content:
          'Both pointers start at position 0. The **fast** pointer advances on every iteration; the **slow** pointer advances only when a condition is met. This creates a partition: everything before `slow` satisfies the condition.\n\n### Remove Duplicates from Sorted Array (LeetCode 26)\n\n```python\n# Python — Remove duplicates in-place\ndef remove_duplicates(nums):\n    if not nums:\n        return 0\n    slow = 0\n    for fast in range(1, len(nums)):\n        if nums[fast] != nums[slow]:\n            slow += 1\n            nums[slow] = nums[fast]\n    return slow + 1\n```\n\n```java\n// Java — Remove duplicates in-place\nint removeDuplicates(int[] nums) {\n    if (nums.length == 0) return 0;\n    int slow = 0;\n    for (int fast = 1; fast < nums.length; fast++) {\n        if (nums[fast] != nums[slow]) {\n            slow++;\n            nums[slow] = nums[fast];\n        }\n    }\n    return slow + 1;\n}\n```\n\n```javascript\n// JavaScript — Remove duplicates in-place\nfunction removeDuplicates(nums) {\n    if (nums.length === 0) return 0;\n    let slow = 0;\n    for (let fast = 1; fast < nums.length; fast++) {\n        if (nums[fast] !== nums[slow]) {\n            slow++;\n            nums[slow] = nums[fast];\n        }\n    }\n    return slow + 1;\n}\n```\n\n```cpp\n// C++ — Remove duplicates in-place\nint removeDuplicates(vector<int>& nums) {\n    if (nums.empty()) return 0;\n    int slow = 0;\n    for (int fast = 1; fast < (int)nums.size(); fast++) {\n        if (nums[fast] != nums[slow]) {\n            slow++;\n            nums[slow] = nums[fast];\n        }\n    }\n    return slow + 1;\n}\n```\n\n### Move Zeroes (LeetCode 283)\n\n```python\n# Python — Move all zeroes to the end, maintain order of non-zero elements\ndef move_zeroes(nums):\n    slow = 0\n    for fast in range(len(nums)):\n        if nums[fast] != 0:\n            nums[slow], nums[fast] = nums[fast], nums[slow]\n            slow += 1\n```\n\n### Floyd\\\'s Cycle Detection (Linked Lists)\n\nAlthough primarily a linked list algorithm, Floyd\\\'s tortoise and hare is the quintessential same-direction two-pointer technique:\n- **Slow** moves 1 step at a time.\n- **Fast** moves 2 steps at a time.\n- If there is a cycle, they will meet; if not, fast reaches null.',
      },
      {
        heading: 'The Three Sum Problem (Two Pointers + Sorting)',
        content:
          'The classic **3Sum** problem (LeetCode 15) asks: find all unique triplets `[a, b, c]` such that `a + b + c = 0`.\n\n### Algorithm\n1. **Sort** the array — O(n log n).\n2. For each element `nums[i]`, use **two pointers** on the remaining subarray to find pairs that sum to `-nums[i]`.\n3. Skip duplicates to avoid repeating triplets.\n\n```python\n# Python — 3Sum\ndef three_sum(nums):\n    nums.sort()\n    result = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i - 1]:\n            continue  # skip duplicate\n        left, right = i + 1, len(nums) - 1\n        while left < right:\n            total = nums[i] + nums[left] + nums[right]\n            if total == 0:\n                result.append([nums[i], nums[left], nums[right]])\n                while left < right and nums[left] == nums[left + 1]:\n                    left += 1  # skip duplicate\n                while left < right and nums[right] == nums[right - 1]:\n                    right -= 1  # skip duplicate\n                left += 1\n                right -= 1\n            elif total < 0:\n                left += 1\n            else:\n                right -= 1\n    return result\n```\n\n```java\n// Java — 3Sum\nList<List<Integer>> threeSum(int[] nums) {\n    Arrays.sort(nums);\n    List<List<Integer>> result = new ArrayList<>();\n    for (int i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] == nums[i - 1]) continue;\n        int left = i + 1, right = nums.length - 1;\n        while (left < right) {\n            int total = nums[i] + nums[left] + nums[right];\n            if (total == 0) {\n                result.add(Arrays.asList(nums[i], nums[left], nums[right]));\n                while (left < right && nums[left] == nums[left + 1]) left++;\n                while (left < right && nums[right] == nums[right - 1]) right--;\n                left++; right--;\n            } else if (total < 0) left++;\n            else right--;\n        }\n    }\n    return result;\n}\n```\n\n```javascript\n// JavaScript — 3Sum\nfunction threeSum(nums) {\n    nums.sort((a, b) => a - b);\n    const result = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n        let left = i + 1, right = nums.length - 1;\n        while (left < right) {\n            const total = nums[i] + nums[left] + nums[right];\n            if (total === 0) {\n                result.push([nums[i], nums[left], nums[right]]);\n                while (left < right && nums[left] === nums[left + 1]) left++;\n                while (left < right && nums[right] === nums[right - 1]) right--;\n                left++; right--;\n            } else if (total < 0) left++;\n            else right--;\n        }\n    }\n    return result;\n}\n```\n\n```cpp\n// C++ — 3Sum\nvector<vector<int>> threeSum(vector<int>& nums) {\n    sort(nums.begin(), nums.end());\n    vector<vector<int>> result;\n    for (int i = 0; i < (int)nums.size() - 2; i++) {\n        if (i > 0 && nums[i] == nums[i - 1]) continue;\n        int left = i + 1, right = (int)nums.size() - 1;\n        while (left < right) {\n            int total = nums[i] + nums[left] + nums[right];\n            if (total == 0) {\n                result.push_back({nums[i], nums[left], nums[right]});\n                while (left < right && nums[left] == nums[left + 1]) left++;\n                while (left < right && nums[right] == nums[right - 1]) right--;\n                left++; right--;\n            } else if (total < 0) left++;\n            else right--;\n        }\n    }\n    return result;\n}\n```\n\n**Complexity:** O(n²) time (n iterations × n two-pointer scan), O(1) extra space (ignoring output).',
      },
      {
        heading: 'Worked Example: Container With Most Water',
        content:
          '**Problem (LeetCode 11):** Given `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`, find two lines that form a container holding the most water.\n\n**Key insight:** Water = `min(height[left], height[right]) * (right - left)`. Move the **shorter** side inward (because moving the taller side can never increase the minimum height).\n\n| Step | left | right | height[l] | height[r] | width | water | max_water | Move |\n|------|------|-------|-----------|-----------|-------|-------|-----------|------|\n| 1 | 0 | 8 | 1 | 7 | 8 | 1×8=8 | 8 | left++ (1 < 7) |\n| 2 | 1 | 8 | 8 | 7 | 7 | 7×7=49 | 49 | right-- (7 < 8) |\n| 3 | 1 | 7 | 8 | 3 | 6 | 3×6=18 | 49 | right-- (3 < 8) |\n| 4 | 1 | 6 | 8 | 8 | 5 | 8×5=40 | 49 | left++ (tie) |\n| 5 | 2 | 6 | 6 | 8 | 4 | 6×4=24 | 49 | left++ (6 < 8) |\n| 6 | 3 | 6 | 2 | 8 | 3 | 2×3=6 | 49 | left++ (2 < 8) |\n| 7 | 4 | 6 | 5 | 8 | 2 | 5×2=10 | 49 | left++ (5 < 8) |\n| 8 | 5 | 6 | 4 | 8 | 1 | 4×1=4 | 49 | left++ (4 < 8) |\n\n`left >= right` → stop. **Answer: 49** (between indices 1 and 8, heights 8 and 7).\n\n### Why Greedy Works\n\nWhen we move the shorter side, we might find a taller line that increases the water volume. Moving the taller side can only decrease the width while the height is capped by the shorter side — so it can never improve the result. This greedy choice ensures we explore every potentially optimal pair in O(n).',
      },
      {
        heading: 'Worked Example: Remove Duplicates Step by Step',
        content:
          'Given sorted array `nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]`. Remove duplicates in-place and return the new length.\n\n| Step | slow | fast | nums[fast] ≠ nums[slow]? | Action | Array State |\n|------|------|------|--------------------------|--------|--------------|\n| Init | 0 | 1 | 0 ≠ 0? No | fast++ | [0,0,1,1,1,2,2,3,3,4] |\n| 1 | 0 | 2 | 1 ≠ 0? **Yes** | slow=1, copy | [0,**1**,1,1,1,2,2,3,3,4] |\n| 2 | 1 | 3 | 1 ≠ 1? No | fast++ | [0,1,1,1,1,2,2,3,3,4] |\n| 3 | 1 | 4 | 1 ≠ 1? No | fast++ | [0,1,1,1,1,2,2,3,3,4] |\n| 4 | 1 | 5 | 2 ≠ 1? **Yes** | slow=2, copy | [0,1,**2**,1,1,2,2,3,3,4] |\n| 5 | 2 | 6 | 2 ≠ 2? No | fast++ | [0,1,2,1,1,2,2,3,3,4] |\n| 6 | 2 | 7 | 3 ≠ 2? **Yes** | slow=3, copy | [0,1,2,**3**,1,2,2,3,3,4] |\n| 7 | 3 | 8 | 3 ≠ 3? No | fast++ | [0,1,2,3,1,2,2,3,3,4] |\n| 8 | 3 | 9 | 4 ≠ 3? **Yes** | slow=4, copy | [0,1,2,3,**4**,2,2,3,3,4] |\n\n**Result:** Return `slow + 1 = 5`. The first 5 elements are `[0, 1, 2, 3, 4]` — all unique.\n\nThe slow pointer marks where the next unique element should go. Everything at or before `slow` is the \"cleaned\" portion of the array.',
      },
      {
        heading: 'Common Interview Problems & When to Use Two Pointers',
        content:
          '### Problem Catalog\n\n| Problem | Variant | Time | Key Insight |\n|---------|---------|------|-------------|\n| Two Sum II (LC 167) | Opposite | O(n) | Sorted array, shrink from both ends |\n| 3Sum (LC 15) | Opposite + loop | O(n²) | Sort + fix one, two-pointer on rest |\n| Container With Most Water (LC 11) | Opposite | O(n) | Move the shorter side |\n| Trapping Rain Water (LC 42) | Opposite | O(n) | Track left/right max heights |\n| Valid Palindrome (LC 125) | Opposite | O(n) | Compare from both ends |\n| Remove Duplicates (LC 26) | Same-direction | O(n) | Slow=write position, fast=read |\n| Move Zeroes (LC 283) | Same-direction | O(n) | Swap non-zero to slow position |\n| Sort Colors (LC 75) | Three pointers | O(n) | Dutch National Flag |\n| Squares of Sorted Array (LC 977) | Opposite | O(n) | Fill result from largest absolute value |\n| Merge Sorted Array (LC 88) | Same-direction (reverse) | O(n+m) | Fill from the end |\n\n### Decision Framework\n\n✅ **Use opposite-direction pointers when:**\n- The input is sorted\n- You need to find a pair satisfying a sum/difference condition\n- You\\\'re comparing elements from opposite ends (palindrome)\n\n✅ **Use same-direction pointers when:**\n- You need to partition or rearrange elements in-place\n- You\\\'re removing/deduplicating while maintaining relative order\n- One pointer reads and another writes\n\n❌ **Don\\\'t force two pointers when:**\n- The data has no meaningful ordering or monotonic property\n- The problem requires checking all subsets, not just contiguous/paired elements\n- A hash map gives a simpler O(n) solution (e.g., unsorted Two Sum)\n\n### Complexity Summary\n\nTwo-pointer solutions are almost always:\n- **Time:** O(n) or O(n log n) if sorting is required\n- **Space:** O(1) extra space (in-place)\n\nThis makes them highly desirable in interviews where interviewers push for optimal space complexity.',
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
      'The sliding window technique maintains a "window" — a contiguous subarray or substring — that expands and contracts as it slides across the input. It transforms brute-force O(n²) or O(n·k) solutions into elegant O(n) algorithms. There are two fundamental flavours: fixed-size windows (where the window width k is given) and variable-size windows (where the window grows and shrinks based on a constraint). This technique is one of the most frequently tested patterns in coding interviews, appearing in problems involving substrings, subarrays, and sequential data. In this article, we will explore both variants in depth with full code examples, trace through worked problems step by step, and cover the most important interview problems that rely on sliding windows.',
    sections: [
      {
        heading: 'The Core Idea Behind Sliding Windows',
        content:
          '### Why Sliding Windows?\n\nConsider finding the maximum sum of any subarray of size `k`. The brute-force approach recalculates the sum for each starting position — O(n·k) total work. But notice: when the window slides right by one position, only **one element enters** and **one element leaves**. We can update our sum in O(1) instead of recomputing it!\n\n```\nWindow at position i:     [ arr[i], arr[i+1], ..., arr[i+k-1] ]\nWindow at position i+1:   [ arr[i+1], arr[i+2], ..., arr[i+k] ]\n\nnew_sum = old_sum - arr[i] + arr[i+k]\n```\n\nThis **incremental update** is the heart of the sliding window technique.\n\n### Two Variants\n\n1. **Fixed-size window:** The window width `k` is predetermined. Slide one step at a time, updating the window state.\n2. **Variable-size window:** The window expands (right pointer moves right) and contracts (left pointer moves right) based on a validity constraint. Used when searching for the longest/shortest subarray or substring satisfying a condition.\n\n### Mental Model\n\nThink of the window as a **caterpillar** crawling along the array:\n- The right end (head) always moves forward, consuming new elements.\n- The left end (tail) sometimes moves forward, releasing old elements.\n- At each position, the window represents a candidate answer.',
      },
      {
        heading: 'Fixed-Size Sliding Window',
        content:
          'When the problem specifies a window size `k`, use this pattern:\n\n### Template\n\n```python\n# Python — Fixed-size sliding window\ndef max_sum_subarray(arr, k):\n    n = len(arr)\n    if n < k:\n        return -1\n    # Initialize the first window\n    window_sum = sum(arr[:k])\n    max_sum = window_sum\n    # Slide the window\n    for i in range(k, n):\n        window_sum += arr[i] - arr[i - k]  # add new, remove old\n        max_sum = max(max_sum, window_sum)\n    return max_sum\n```\n\n```java\n// Java — Fixed-size sliding window\nint maxSumSubarray(int[] arr, int k) {\n    int windowSum = 0;\n    for (int i = 0; i < k; i++) windowSum += arr[i];\n    int maxSum = windowSum;\n    for (int i = k; i < arr.length; i++) {\n        windowSum += arr[i] - arr[i - k];\n        maxSum = Math.max(maxSum, windowSum);\n    }\n    return maxSum;\n}\n```\n\n```javascript\n// JavaScript — Fixed-size sliding window\nfunction maxSumSubarray(arr, k) {\n    let windowSum = 0;\n    for (let i = 0; i < k; i++) windowSum += arr[i];\n    let maxSum = windowSum;\n    for (let i = k; i < arr.length; i++) {\n        windowSum += arr[i] - arr[i - k];\n        maxSum = Math.max(maxSum, windowSum);\n    }\n    return maxSum;\n}\n```\n\n```cpp\n// C++ — Fixed-size sliding window\nint maxSumSubarray(vector<int>& arr, int k) {\n    int windowSum = 0;\n    for (int i = 0; i < k; i++) windowSum += arr[i];\n    int maxSum = windowSum;\n    for (int i = k; i < (int)arr.size(); i++) {\n        windowSum += arr[i] - arr[i - k];\n        maxSum = max(maxSum, windowSum);\n    }\n    return maxSum;\n}\n```\n\n**Time:** O(n) — each element is added and removed exactly once.\n**Space:** O(1) — only storing the running sum.\n\n### Other Fixed-Size Applications\n- **Maximum average subarray of length k** (LeetCode 643)\n- **Moving average from data stream** (LeetCode 346)\n- **Find all anagrams in a string** (LeetCode 438) — fixed window of size `len(pattern)`',
      },
      {
        heading: 'Variable-Size Sliding Window',
        content:
          'When searching for the **longest or shortest** subarray/substring satisfying a constraint, use a variable-size window:\n\n### Template — Longest Valid Window\n\n```python\n# Python — Variable-size sliding window (find longest)\ndef longest_valid_window(arr):\n    left = 0\n    best = 0\n    window_state = {}  # track window contents\n    for right in range(len(arr)):\n        # Expand: add arr[right] to window state\n        update_state(window_state, arr[right])\n        # Contract: shrink until window is valid\n        while not is_valid(window_state):\n            remove_state(window_state, arr[left])\n            left += 1\n        # Update answer\n        best = max(best, right - left + 1)\n    return best\n```\n\n### Template — Shortest Valid Window\n\n```python\n# Python — Variable-size sliding window (find shortest)\ndef shortest_valid_window(arr):\n    left = 0\n    best = float(\\\'inf\\\')\n    window_state = {}\n    for right in range(len(arr)):\n        update_state(window_state, arr[right])\n        while is_valid(window_state):\n            best = min(best, right - left + 1)\n            remove_state(window_state, arr[left])\n            left += 1\n    return best if best != float(\\\'inf\\\') else 0\n```\n\n### The Key Difference\n\n- **Longest:** Shrink the window only when it becomes **invalid**, then update the answer.\n- **Shortest:** Update the answer when the window is **valid**, then try to shrink further.\n\n### Why O(n)?\n\nAlthough there\\\'s a `while` loop inside the `for` loop, each element is added to the window **at most once** and removed **at most once**. The left pointer never moves backward. Total operations: **at most 2n**, which is O(n).',
      },
      {
        heading: 'Key Sliding Window Problems with Full Solutions',
        content:
          '### Longest Substring Without Repeating Characters (LeetCode 3)\n\n```python\n# Python\ndef length_of_longest_substring(s):\n    char_index = {}  # character -> its latest index\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        if s[right] in char_index and char_index[s[right]] >= left:\n            left = char_index[s[right]] + 1\n        char_index[s[right]] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n```\n\n```java\n// Java\nint lengthOfLongestSubstring(String s) {\n    Map<Character, Integer> charIndex = new HashMap<>();\n    int left = 0, maxLen = 0;\n    for (int right = 0; right < s.length(); right++) {\n        char c = s.charAt(right);\n        if (charIndex.containsKey(c) && charIndex.get(c) >= left) {\n            left = charIndex.get(c) + 1;\n        }\n        charIndex.put(c, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\n```\n\n```javascript\n// JavaScript\nfunction lengthOfLongestSubstring(s) {\n    const charIndex = new Map();\n    let left = 0, maxLen = 0;\n    for (let right = 0; right < s.length; right++) {\n        if (charIndex.has(s[right]) && charIndex.get(s[right]) >= left) {\n            left = charIndex.get(s[right]) + 1;\n        }\n        charIndex.set(s[right], right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\n```\n\n```cpp\n// C++\nint lengthOfLongestSubstring(string s) {\n    unordered_map<char, int> charIndex;\n    int left = 0, maxLen = 0;\n    for (int right = 0; right < (int)s.size(); right++) {\n        if (charIndex.count(s[right]) && charIndex[s[right]] >= left) {\n            left = charIndex[s[right]] + 1;\n        }\n        charIndex[s[right]] = right;\n        maxLen = max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\n```\n\n### Minimum Window Substring (LeetCode 76)\n\nFind the smallest window in `s` that contains all characters of `t`.\n\n```python\n# Python — Minimum Window Substring\nfrom collections import Counter\n\ndef min_window(s, t):\n    need = Counter(t)\n    missing = len(t)\n    left = 0\n    best_left, best_right = 0, float(\\\'inf\\\')\n    for right in range(len(s)):\n        if need[s[right]] > 0:\n            missing -= 1\n        need[s[right]] -= 1\n        while missing == 0:  # window contains all chars of t\n            if right - left < best_right - best_left:\n                best_left, best_right = left, right\n            need[s[left]] += 1\n            if need[s[left]] > 0:\n                missing += 1\n            left += 1\n    return s[best_left:best_right + 1] if best_right != float(\\\'inf\\\') else \"\"\n```',
      },
      {
        heading: 'Worked Example: Longest Substring Without Repeating Characters',
        content:
          'Given `s = \"abcabcbb\"`, find the length of the longest substring without repeating characters.\n\nWe use a hash map `char_index` to store the latest index of each character, and a `left` pointer for the window start.\n\n| Step | right | s[right] | s[right] in map & >= left? | Action | left | Window | max_len |\n|------|-------|----------|---------------------------|--------|------|--------|---------|\n| 1 | 0 | a | No | map[a]=0 | 0 | \"a\" | 1 |\n| 2 | 1 | b | No | map[b]=1 | 0 | \"ab\" | 2 |\n| 3 | 2 | c | No | map[c]=2 | 0 | \"abc\" | 3 |\n| 4 | 3 | a | Yes (map[a]=0, 0≥0) | left=1, map[a]=3 | 1 | \"bca\" | 3 |\n| 5 | 4 | b | Yes (map[b]=1, 1≥1) | left=2, map[b]=4 | 2 | \"cab\" | 3 |\n| 6 | 5 | c | Yes (map[c]=2, 2≥2) | left=3, map[c]=5 | 3 | \"abc\" | 3 |\n| 7 | 6 | b | Yes (map[b]=4, 4≥3) | left=5, map[b]=6 | 5 | \"cb\" | 3 |\n| 8 | 7 | b | Yes (map[b]=6, 6≥5) | left=7, map[b]=7 | 7 | \"b\" | 3 |\n\n**Result:** The longest substring without repeating characters has length **3** (\"abc\").\n\n### Key Observations\n\n- When we encounter a duplicate, we jump `left` forward past the previous occurrence — we don\\\'t slide one step at a time.\n- The hash map stores the **most recent index** of each character, enabling O(1) jump.\n- Each character is processed once by the right pointer. The left pointer only moves forward. Total: **O(n)**.',
      },
      {
        heading: 'Worked Example: Fixed-Size Window Maximum Sum',
        content:
          'Given `arr = [2, 1, 5, 1, 3, 2]`, `k = 3`. Find the maximum sum of any subarray of size 3.\n\n**Step 1: Initialize the first window (indices 0–2)**\n\n`window_sum = 2 + 1 + 5 = 8`\n`max_sum = 8`\n\n**Step 2: Slide the window**\n\n| Step | i | Enter arr[i] | Leave arr[i-k] | window_sum | max_sum |\n|------|---|-------------|----------------|------------|--------|\n| 1 | 3 | arr[3]=1 | arr[0]=2 | 8+1-2=7 | 8 |\n| 2 | 4 | arr[4]=3 | arr[1]=1 | 7+3-1=9 | **9** |\n| 3 | 5 | arr[5]=2 | arr[2]=5 | 9+2-5=6 | 9 |\n\n**Result:** Maximum sum is **9**, corresponding to subarray `[5, 1, 3]` (indices 2–4).\n\n### Visualizing the Sliding\n\n```\nStep 0: [2, 1, 5] 1, 3, 2   → sum = 8\nStep 1:  2 [1, 5, 1] 3, 2   → sum = 7\nStep 2:  2, 1 [5, 1, 3] 2   → sum = 9  ★ maximum\nStep 3:  2, 1, 5 [1, 3, 2]  → sum = 6\n```\n\nEach slide costs O(1) — one addition and one subtraction. Total: O(n).',
      },
      {
        heading: 'Advanced: Sliding Window with Auxiliary Data Structures',
        content:
          '### Sliding Window Maximum (LeetCode 239)\n\nGiven an array and window size `k`, find the maximum in each window position. A naive approach is O(n·k). Using a **monotonic deque**, we achieve O(n).\n\n```python\n# Python — Sliding Window Maximum with Monotonic Deque\nfrom collections import deque\n\ndef max_sliding_window(nums, k):\n    dq = deque()  # stores indices; values are in decreasing order\n    result = []\n    for i in range(len(nums)):\n        # Remove indices outside the window\n        while dq and dq[0] < i - k + 1:\n            dq.popleft()\n        # Remove smaller elements (they can never be the max)\n        while dq and nums[dq[-1]] < nums[i]:\n            dq.pop()\n        dq.append(i)\n        # Window is fully formed starting at index k-1\n        if i >= k - 1:\n            result.append(nums[dq[0]])\n    return result\n```\n\n```java\n// Java — Sliding Window Maximum\nint[] maxSlidingWindow(int[] nums, int k) {\n    Deque<Integer> dq = new ArrayDeque<>();\n    int[] result = new int[nums.length - k + 1];\n    int ri = 0;\n    for (int i = 0; i < nums.length; i++) {\n        while (!dq.isEmpty() && dq.peekFirst() < i - k + 1)\n            dq.pollFirst();\n        while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i])\n            dq.pollLast();\n        dq.offerLast(i);\n        if (i >= k - 1)\n            result[ri++] = nums[dq.peekFirst()];\n    }\n    return result;\n}\n```\n\n```cpp\n// C++ — Sliding Window Maximum\nvector<int> maxSlidingWindow(vector<int>& nums, int k) {\n    deque<int> dq;\n    vector<int> result;\n    for (int i = 0; i < (int)nums.size(); i++) {\n        while (!dq.empty() && dq.front() < i - k + 1)\n            dq.pop_front();\n        while (!dq.empty() && nums[dq.back()] < nums[i])\n            dq.pop_back();\n        dq.push_back(i);\n        if (i >= k - 1)\n            result.push_back(nums[dq.front()]);\n    }\n    return result;\n}\n```\n\n### Why Monotonic Deque?\n\nThe deque maintains indices in **decreasing order of values**. The front is always the maximum of the current window. When a new element is larger than existing elements in the deque, those elements can never be the maximum — so we pop them. Each element enters and leaves the deque at most once → **O(n) total**.\n\n### Other Advanced Combinations\n\n- **Sliding window + hash map:** Track character frequencies (Minimum Window Substring, Find All Anagrams)\n- **Sliding window + multiset/heap:** Maintain sorted window elements (Sliding Window Median)\n- **Sliding window + prefix sum:** Count subarrays satisfying a sum condition',
      },
      {
        heading: 'Common Interview Problems & Decision Framework',
        content:
          '### Problem Catalog\n\n| Problem | Type | Time | Space | Key Technique |\n|---------|------|------|-------|---------------|\n| Max Sum Subarray of Size K | Fixed | O(n) | O(1) | Running sum |\n| Maximum Average Subarray (LC 643) | Fixed | O(n) | O(1) | Running sum |\n| Find All Anagrams (LC 438) | Fixed | O(n) | O(1) | Frequency array comparison |\n| Longest Substring Without Repeating Chars (LC 3) | Variable | O(n) | O(min(n,m)) | Hash map for last index |\n| Longest Repeating Character Replacement (LC 424) | Variable | O(n) | O(1) | Track max frequency in window |\n| Minimum Window Substring (LC 76) | Variable | O(n) | O(m) | Two frequency maps |\n| Permutation in String (LC 567) | Fixed | O(n) | O(1) | Frequency array match |\n| Sliding Window Maximum (LC 239) | Fixed | O(n) | O(k) | Monotonic deque |\n| Minimum Size Subarray Sum (LC 209) | Variable | O(n) | O(1) | Shrink when sum ≥ target |\n| Substring with Concatenation of All Words (LC 30) | Fixed | O(n·m) | O(m) | Word-level sliding window |\n\n### Decision Framework\n\n**Step 1: Is the window size fixed?**\n- Yes → Use fixed-size template. Maintain a running aggregate (sum, frequency map, etc.)\n- No → Go to Step 2.\n\n**Step 2: What are you optimizing?**\n- Finding the **longest** valid window → Expand right, shrink left only when invalid.\n- Finding the **shortest** valid window → Expand right, update answer when valid, then shrink.\n\n**Step 3: What state does the window need?**\n- Sum → single variable\n- Character frequencies → array of size 26 or 128\n- Distinct count → hash set\n- Min/max in window → monotonic deque or multiset\n\n### Tips for Sliding Window Problems\n\n1. **Identify the constraint** — what makes the window valid or invalid?\n2. Use a **hash map or frequency array** to track the window state efficiently.\n3. Always update the answer **at the right moment** — after adjusting for longest, during valid check for shortest.\n4. Sliding window is complementary to **two pointers** — the left and right bounds of the window are essentially two pointers moving in the same direction.\n5. **Draw the window** on paper for the first few iterations to build intuition before coding.',
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
