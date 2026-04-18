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
      'A linked list is a linear collection of nodes where each node stores a value and a pointer (reference) to the next node in the sequence. Unlike arrays, linked lists do not occupy contiguous memory — nodes are individually allocated on the heap and connected solely through their pointers. This gives linked lists O(1) insertion and deletion at any position where you already hold a reference, but sacrifices O(1) random access: reaching the kth element requires traversing k pointers from the head. Linked list problems are among the most popular in coding interviews because they test precise pointer manipulation, edge-case handling (empty lists, single nodes, cycles), and the ability to reason about in-place mutations without extra space. In this deep-dive we explore memory layout, implement all core operations in four languages, master essential techniques like reversal and cycle detection, and trace through worked examples step by step.',
    sections: [
      {
        heading: 'How Linked Lists Work in Memory',
        content:
          'Unlike arrays, which store elements in a contiguous block of memory, a linked list allocates each node **independently on the heap**. Each node contains (1) the stored value and (2) one or more pointers to other nodes. The nodes can live at arbitrary memory addresses — the only thing connecting them is the pointer chain.\n\n### Memory Layout\n\nConsider a singly linked list storing [10, 20, 30]:\n\n```\nAddress    Contents\n0x4A00     | val: 10 | next: 0x4C80 | ← head\n0x4C80     | val: 20 | next: 0x4B40 |\n0x4B40     | val: 30 | next: null   | ← tail\n```\n\nNotice the addresses are **not sequential** — node 2 is at a higher address than node 3. The CPU cannot predict which memory location comes next, so it cannot prefetch cache lines effectively.\n\n### Per-Node Memory Overhead\n\nEach node carries pointer overhead on top of the data:\n- **Singly linked list**: 1 pointer per node (8 bytes on 64-bit systems).\n- **Doubly linked list**: 2 pointers per node (16 bytes).\n- Plus the object/struct header in languages with managed memory (Java ~16 bytes, Python ~56 bytes per object).\n\nFor storing `n` integers, an array uses roughly `4n` bytes, while a singly linked list uses `(4 + 8)n = 12n` bytes minimum — **3× more memory** plus poor cache locality.\n\n### Cache Performance\n\nArrays benefit from **spatial locality** — accessing one element loads neighboring elements into the CPU cache line (typically 64 bytes). Linked list traversal suffers **cache misses** at nearly every node because nodes are scattered across the heap. In practice, iterating a linked list can be 10–100× slower than iterating an array of the same size due to cache effects.\n\n### When to Use Linked Lists\n\nDespite their overhead, linked lists excel when:\n- You need **O(1) insertion/deletion** at known positions (e.g., implementing an LRU cache with a doubly linked list).\n- The data structure must support **constant-time splicing** (moving a sublist from one position to another).\n- You cannot afford the **amortized O(n) resize cost** of dynamic arrays.',
      },
      {
        heading: 'Node Structure & Types of Linked Lists',
        content:
          '### Singly Linked List Node\n\nEach node holds a value and a pointer to the next node. The list is accessed through a `head` pointer.\n\n```python\n# Python — Singly Linked List Node\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n```\n\n```java\n// Java — Singly Linked List Node\nclass ListNode {\n    int val;\n    ListNode next;\n    ListNode(int val) { this.val = val; this.next = null; }\n    ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n}\n```\n\n```javascript\n// JavaScript — Singly Linked List Node\nclass ListNode {\n    constructor(val = 0, next = null) {\n        this.val = val;\n        this.next = next;\n    }\n}\n```\n\n```cpp\n// C++ — Singly Linked List Node\nstruct ListNode {\n    int val;\n    ListNode* next;\n    ListNode(int v) : val(v), next(nullptr) {}\n    ListNode(int v, ListNode* n) : val(v), next(n) {}\n};\n```\n\n### Doubly Linked List\n\nEach node has both `next` and `prev` pointers, allowing traversal in both directions. Doubly linked lists are essential for implementing **LRU caches** (LeetCode 146), where you need O(1) removal of arbitrary nodes.\n\n```python\n# Python — Doubly Linked List Node\nclass DListNode:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n```\n\n### Circular Linked List\n\nThe tail’s `next` pointer points back to the head, forming a cycle. Useful for round-robin scheduling and the Josephus problem. To detect the end of a traversal, check if `current.next == head`.\n\n### Summary Table\n\n| Type | Pointers per Node | Traversal | Use Cases |\n|------|------------------|-----------|-----------|\n| Singly | 1 (`next`) | Forward only | Stacks, simple chains |\n| Doubly | 2 (`next`, `prev`) | Both directions | LRU cache, deques |\n| Circular | 1 or 2 | Loop forever | Round-robin, Josephus |',
      },
      {
        heading: 'Core Linked List Operations in Four Languages',
        content:
          '### Insertion at Head — O(1)\n\nCreate a new node and point it to the current head:\n\n```python\n# Python — Insert at head\ndef insert_head(head, val):\n    new_node = ListNode(val)\n    new_node.next = head\n    return new_node  # new_node is the new head\n```\n\n```java\n// Java — Insert at head\nListNode insertHead(ListNode head, int val) {\n    ListNode newNode = new ListNode(val);\n    newNode.next = head;\n    return newNode;\n}\n```\n\n```javascript\n// JavaScript — Insert at head\nfunction insertHead(head, val) {\n    const newNode = new ListNode(val);\n    newNode.next = head;\n    return newNode;\n}\n```\n\n```cpp\n// C++ — Insert at head\nListNode* insertHead(ListNode* head, int val) {\n    ListNode* newNode = new ListNode(val);\n    newNode->next = head;\n    return newNode;\n}\n```\n\n### Insertion at Tail — O(n)\n\nTraverse to the last node and append:\n\n```python\n# Python — Insert at tail\ndef insert_tail(head, val):\n    new_node = ListNode(val)\n    if not head:\n        return new_node\n    curr = head\n    while curr.next:\n        curr = curr.next\n    curr.next = new_node\n    return head\n```\n\n### Deletion of a Node — O(n) to find, O(1) to remove\n\nTo delete a node with value `target`, find its predecessor and re-wire:\n\n```python\n# Python — Delete first occurrence of target\ndef delete_node(head, target):\n    dummy = ListNode(0)\n    dummy.next = head\n    prev = dummy\n    curr = head\n    while curr:\n        if curr.val == target:\n            prev.next = curr.next\n            return dummy.next\n        prev = curr\n        curr = curr.next\n    return dummy.next\n```\n\n```java\n// Java — Delete first occurrence\nListNode deleteNode(ListNode head, int target) {\n    ListNode dummy = new ListNode(0);\n    dummy.next = head;\n    ListNode prev = dummy, curr = head;\n    while (curr != null) {\n        if (curr.val == target) {\n            prev.next = curr.next;\n            return dummy.next;\n        }\n        prev = curr;\n        curr = curr.next;\n    }\n    return dummy.next;\n}\n```\n\n### Search — O(n)\n\n```python\n# Python — Search for value\ndef search(head, target):\n    curr = head\n    while curr:\n        if curr.val == target:\n            return True\n        curr = curr.next\n    return False\n```\n\n### Complexity Summary\n\n| Operation | Time | Space |\n|-----------|------|-------|\n| Insert at head | O(1) | O(1) |\n| Insert at tail | O(n) | O(1) |\n| Delete (by value) | O(n) | O(1) |\n| Search | O(n) | O(1) |\n| Access by index | O(n) | O(1) |',
      },
      {
        heading: 'Essential Techniques: Dummy Head & Fast/Slow Pointers',
        content:
          '### The Dummy Head (Sentinel Node)\n\nA **dummy head** is a fake node placed before the real head. It eliminates edge cases when the head might change (insertion at front, deletion of head).\n\n```python\n# Without dummy head — must handle head change separately\ndef remove_elements(head, val):\n    while head and head.val == val:\n        head = head.next\n    curr = head\n    while curr and curr.next:\n        if curr.next.val == val:\n            curr.next = curr.next.next\n        else:\n            curr = curr.next\n    return head\n\n# With dummy head — clean and uniform\ndef remove_elements_v2(head, val):\n    dummy = ListNode(0)\n    dummy.next = head\n    curr = dummy\n    while curr.next:\n        if curr.next.val == val:\n            curr.next = curr.next.next\n        else:\n            curr = curr.next\n    return dummy.next\n```\n\n**Rule of thumb:** If the head of the list might change, use a dummy head.\n\n### Fast & Slow Pointers (The Tortoise and Hare)\n\nTwo pointers moving at different speeds through the list:\n- **Slow** moves 1 step at a time.\n- **Fast** moves 2 steps at a time.\n\n**Finding the middle node** — When fast reaches the end, slow is at the middle:\n\n```python\n# Python — Find middle of linked list\ndef find_middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow  # middle node\n```\n\n```java\n// Java — Find middle\nListNode findMiddle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n    }\n    return slow;\n}\n```\n\n**Detecting a cycle** — If fast and slow ever meet, there is a cycle:\n\n```python\n# Python — Detect cycle (Floyd’s algorithm)\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False\n```\n\n### Merging Two Sorted Lists\n\nUse a dummy head and two pointers — compare the fronts of both lists, appending the smaller:\n\n```python\n# Python — Merge two sorted linked lists\ndef merge_two_lists(l1, l2):\n    dummy = ListNode(0)\n    tail = dummy\n    while l1 and l2:\n        if l1.val <= l2.val:\n            tail.next = l1\n            l1 = l1.next\n        else:\n            tail.next = l2\n            l2 = l2.next\n        tail = tail.next\n    tail.next = l1 or l2\n    return dummy.next\n```',
      },
      {
        heading: 'In-Place Reversal: The Most Important Linked List Algorithm',
        content:
          'Reversing a linked list in-place is the single most important linked list algorithm. It appears directly in interviews and as a subroutine in dozens of other problems (reverse a sublist, palindrome check, reorder list).\n\n### Iterative Reversal — O(n) time, O(1) space\n\nThe idea: walk through the list, and for each node, re-point its `next` to the **previous** node.\n\n```python\n# Python — Iterative reversal\ndef reverse_list(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next    # save next\n        curr.next = prev   # reverse pointer\n        prev = curr        # advance prev\n        curr = nxt         # advance curr\n    return prev            # prev is the new head\n```\n\n```java\n// Java — Iterative reversal\nListNode reverseList(ListNode head) {\n    ListNode prev = null, curr = head;\n    while (curr != null) {\n        ListNode nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}\n```\n\n```javascript\n// JavaScript — Iterative reversal\nfunction reverseList(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}\n```\n\n```cpp\n// C++ — Iterative reversal\nListNode* reverseList(ListNode* head) {\n    ListNode* prev = nullptr;\n    ListNode* curr = head;\n    while (curr) {\n        ListNode* nxt = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}\n```\n\n### Recursive Reversal — O(n) time, O(n) space (call stack)\n\n```python\n# Python — Recursive reversal\ndef reverse_list_recursive(head):\n    if not head or not head.next:\n        return head\n    new_head = reverse_list_recursive(head.next)\n    head.next.next = head  # the node after head points back to head\n    head.next = None       # head now points to nothing\n    return new_head\n```\n\nThe recursive approach is elegant but uses O(n) stack space. Interviewers usually prefer the iterative version for its O(1) space, but knowing both demonstrates deep understanding.',
      },
      {
        heading: 'Worked Example: Reversing a Linked List Step by Step',
        content:
          'Let’s trace the iterative reversal on the list `1 → 2 → 3 → 4 → null`.\n\n**Initial state:** `prev = null`, `curr = node(1)`\n\n| Step | curr | nxt = curr.next | Action: curr.next = prev | Advance: prev = curr, curr = nxt |\n|------|------|-----------------|--------------------------|----------------------------------|\n| 1 | 1 | 2 | 1.next = null | prev = 1, curr = 2 |\n| 2 | 2 | 3 | 2.next = 1 | prev = 2, curr = 3 |\n| 3 | 3 | 4 | 3.next = 2 | prev = 3, curr = 4 |\n| 4 | 4 | null | 4.next = 3 | prev = 4, curr = null |\n\n**Loop ends** because `curr == null`. Return `prev = node(4)`.\n\n**Result:** `4 → 3 → 2 → 1 → null` ✓\n\n### Visualizing Each Step\n\n```\nStep 0: null    1 → 2 → 3 → 4 → null\n               prev curr\n\nStep 1: null ← 1    2 → 3 → 4 → null\n              prev  curr\n\nStep 2: null ← 1 ← 2    3 → 4 → null\n                   prev  curr\n\nStep 3: null ← 1 ← 2 ← 3    4 → null\n                        prev  curr\n\nStep 4: null ← 1 ← 2 ← 3 ← 4    null\n                             prev  curr\n```\n\n### The Critical Insight\n\nAt each step, you must save `curr.next` **before** overwriting it. If you write `curr.next = prev` first, you lose the reference to the rest of the list. This is the most common bug in linked list reversal.\n\n### Partial Reversal (Reverse Between Positions)\n\nMany interview problems ask you to reverse only a portion of the list (e.g., LeetCode 92 — Reverse Linked List II). The technique is the same, but you need to save the nodes just before and after the reversed segment to reconnect them.',
      },
      {
        heading: 'Worked Example: Cycle Detection with Floyd’s Algorithm',
        content:
          'Floyd’s cycle detection (tortoise and hare) uses two pointers moving at different speeds. If a cycle exists, they **must** meet inside the cycle.\n\n### Setup\n\nConsider a list where node 4’s `next` points back to node 2, creating a cycle:\n\n```\n1 → 2 → 3 → 4\n    ↑         |\n    └─────────┘\n```\n\n### Trace\n\n| Step | slow | fast | slow == fast? |\n|------|------|------|---------------|\n| Init | 1 | 1 | No |\n| 1 | 2 | 3 | No |\n| 2 | 3 | 2 (4→2) | No |\n| 3 | 4 | 4 (3→4) | **Yes!** |\n\nThe pointers meet at node 4 — a cycle is detected.\n\n### Why Does This Work?\n\nSuppose the cycle has length `C` and the slow pointer enters the cycle after `k` steps. At that point, the fast pointer is already inside the cycle and is some distance `d` ahead. Each step, the gap between them decreases by 1 (fast gains 1 step, but it’s inside the cycle). After `C - d` more steps, they meet. The total time is O(n), and the space is O(1) — no hash set needed.\n\n### Finding the Cycle Start\n\nOnce a cycle is detected, finding where it begins requires a second phase:\n\n1. Move one pointer back to `head`.\n2. Move both pointers at **the same speed** (1 step each).\n3. Where they meet is the **start of the cycle**.\n\n```python\n# Python — Find cycle start\ndef detect_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            # Phase 2: find cycle start\n            slow = head\n            while slow != fast:\n                slow = slow.next\n                fast = fast.next\n            return slow  # cycle start node\n    return None  # no cycle\n```\n\n```java\n// Java — Find cycle start\nListNode detectCycle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) {\n            slow = head;\n            while (slow != fast) {\n                slow = slow.next;\n                fast = fast.next;\n            }\n            return slow;\n        }\n    }\n    return null;\n}\n```\n\n### Mathematical Proof (Brief)\n\nLet `F` = distance from head to cycle start, `a` = distance from cycle start to meeting point, and `C` = cycle length. When they meet: slow traveled `F + a`, fast traveled `F + a + nC` for some integer n. Since fast moves twice as far: `2(F + a) = F + a + nC`, giving `F + a = nC`, so `F = nC - a`. This means walking `F` steps from the meeting point lands you at the cycle start — exactly what phase 2 does.',
      },
      {
        heading: 'Common Interview Problems & Solution Approaches',
        content:
          '### Easy\n- **Reverse Linked List** (LeetCode 206) — Iterative pointer reversal. O(n) time, O(1) space.\n- **Merge Two Sorted Lists** (LeetCode 21) — Dummy head + two pointers. O(n + m).\n- **Linked List Cycle** (LeetCode 141) — Fast/slow pointers (Floyd’s). O(n) time, O(1) space.\n- **Remove Duplicates from Sorted List** (LeetCode 83) — Single pass comparing adjacent nodes. O(n).\n- **Middle of the Linked List** (LeetCode 876) — Fast/slow pointers. O(n).\n\n### Medium\n- **Add Two Numbers** (LeetCode 2) — Simulate digit-by-digit addition with carry. O(max(m,n)).\n- **Remove Nth Node From End** (LeetCode 19) — Two pointers with n-gap. O(n) single pass.\n- **Linked List Cycle II** (LeetCode 142) — Floyd’s two-phase cycle start detection. O(n) time, O(1) space.\n- **Reorder List** (LeetCode 143) — Find middle + reverse second half + merge. O(n).\n- **Copy List with Random Pointer** (LeetCode 138) — Hash map of old→new nodes, or interleaving trick. O(n).\n- **Swap Nodes in Pairs** (LeetCode 24) — Iterative or recursive pairwise swap. O(n).\n\n### Hard\n- **Merge k Sorted Lists** (LeetCode 23) — Min-heap of k list heads, or divide-and-conquer merge. O(n log k).\n- **Reverse Nodes in k-Group** (LeetCode 25) — Count k nodes, reverse the group, recurse. O(n).\n- **LRU Cache** (LeetCode 146) — Hash map + doubly linked list for O(1) get/put. Classic system design.\n\n### Interview Tips\n\n1. **Always draw the pointers** — sketch the list and arrows before coding.\n2. **Use a dummy head** whenever the head might change.\n3. **Save references before re-wiring** — the most common bug is losing the `next` pointer.\n4. **Consider edge cases**: empty list, single node, two nodes, cycle at head, cycle at tail.\n5. **Know the patterns**: reversal, fast/slow, dummy head, merge — these cover 90% of linked list problems.',
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
      'Trees are hierarchical data structures where nodes are connected by directed edges from parent to child, forming an inverted tree shape rooted at a single node. A binary tree restricts each node to at most two children (left and right), and a Binary Search Tree (BST) adds the invariant that every left descendant is smaller and every right descendant is larger than the current node. This ordering enables O(log n) search, insertion, and deletion in balanced trees — matching the performance of binary search on a sorted array while supporting efficient dynamic insertion. Trees appear in roughly 25 percent of coding interview questions, ranging from simple depth calculations to complex serialization and reconstruction. In this comprehensive guide, we explore how trees are stored in memory, implement all four traversal orders and core BST operations in four programming languages, study common patterns and techniques, trace through detailed worked examples, and survey the most common tree interview problems.',
    sections: [
      {
        heading: 'How Trees Work in Memory',
        content:
          'A tree is a collection of **nodes** where each node stores a value and pointers to its children. In a binary tree, each node has at most two child pointers: `left` and `right`.\n\n### Memory Layout\n\nUnlike arrays, tree nodes are **heap-allocated** and scattered across memory, connected only by pointers:\n\n```\nNode at 0x2000: { val: 8, left: 0x2040, right: 0x2080 }  ← root\nNode at 0x2040: { val: 3, left: 0x20C0, right: 0x2100 }\nNode at 0x2080: { val: 10, left: null, right: 0x2140 }\nNode at 0x20C0: { val: 1, left: null, right: null }\nNode at 0x2100: { val: 6, left: null, right: null }\nNode at 0x2140: { val: 14, left: null, right: null }\n```\n\n### Node Definition in Four Languages\n\n```python\n# Python\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n```\n\n```java\n// Java\nclass TreeNode {\n    int val;\n    TreeNode left, right;\n    TreeNode(int val) { this.val = val; }\n}\n```\n\n```javascript\n// JavaScript\nclass TreeNode {\n    constructor(val = 0, left = null, right = null) {\n        this.val = val;\n        this.left = left;\n        this.right = right;\n    }\n}\n```\n\n```cpp\n// C++\nstruct TreeNode {\n    int val;\n    TreeNode* left;\n    TreeNode* right;\n    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}\n};\n```\n\n### Key Terminology\n\n- **Root** — the topmost node (no parent).\n- **Leaf** — a node with no children.\n- **Height** — the longest path from root to a leaf. A balanced tree has height O(log n).\n- **Depth** — the distance from the root to a given node.\n- **Complete binary tree** — every level is full except possibly the last, which is filled left to right.\n- **Full binary tree** — every node has 0 or 2 children.',
      },
      {
        heading: 'Tree Traversals: DFS & BFS in Four Languages',
        content:
          'Every tree problem starts with traversal — visiting nodes in a specific order. There are four fundamental traversals.\n\n### DFS Traversals (Recursive)\n\n```python\n# Python — All three DFS traversals\ndef inorder(root):\n    if not root: return []\n    return inorder(root.left) + [root.val] + inorder(root.right)\n\ndef preorder(root):\n    if not root: return []\n    return [root.val] + preorder(root.left) + preorder(root.right)\n\ndef postorder(root):\n    if not root: return []\n    return postorder(root.left) + postorder(root.right) + [root.val]\n```\n\n```java\n// Java — In-order traversal (iterative with stack)\nList<Integer> inorderTraversal(TreeNode root) {\n    List<Integer> result = new ArrayList<>();\n    Deque<TreeNode> stack = new ArrayDeque<>();\n    TreeNode curr = root;\n    while (curr != null || !stack.isEmpty()) {\n        while (curr != null) {\n            stack.push(curr);\n            curr = curr.left;\n        }\n        curr = stack.pop();\n        result.add(curr.val);\n        curr = curr.right;\n    }\n    return result;\n}\n```\n\n```javascript\n// JavaScript — Pre-order traversal (iterative with stack)\nfunction preorderTraversal(root) {\n    if (!root) return [];\n    const result = [];\n    const stack = [root];\n    while (stack.length > 0) {\n        const node = stack.pop();\n        result.push(node.val);\n        if (node.right) stack.push(node.right);\n        if (node.left) stack.push(node.left);\n    }\n    return result;\n}\n```\n\n```cpp\n// C++ — Post-order traversal (recursive)\nvoid postorder(TreeNode* root, vector<int>& result) {\n    if (!root) return;\n    postorder(root->left, result);\n    postorder(root->right, result);\n    result.push_back(root->val);\n}\n```\n\n### BFS / Level-Order Traversal\n\nVisit nodes level by level using a **queue**:\n\n```python\n# Python — Level-order traversal\nfrom collections import deque\n\ndef level_order(root):\n    if not root: return []\n    result = []\n    queue = deque([root])\n    while queue:\n        level = []\n        for _ in range(len(queue)):\n            node = queue.popleft()\n            level.append(node.val)\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        result.append(level)\n    return result\n```\n\n### Traversal Summary\n\n| Traversal | Order | Key Use Case |\n|-----------|-------|-------------|\n| In-order | Left → Root → Right | Produces sorted output from BST |\n| Pre-order | Root → Left → Right | Serialize a tree, copy a tree |\n| Post-order | Left → Right → Root | Delete a tree, evaluate expressions |\n| Level-order | Level by level | Find min depth, right-side view |',
      },
      {
        heading: 'Binary Search Tree Operations in Four Languages',
        content:
          'The BST property — `left < root < right` — enables efficient searching, insertion, and deletion.\n\n### Search — O(h) where h is the height\n\n```python\n# Python — BST search\ndef search_bst(root, target):\n    if not root: return None\n    if target == root.val: return root\n    if target < root.val: return search_bst(root.left, target)\n    return search_bst(root.right, target)\n```\n\n### Insertion — O(h)\n\nNavigate to the correct leaf position and attach the new node:\n\n```python\n# Python — BST insert\ndef insert_bst(root, val):\n    if not root: return TreeNode(val)\n    if val < root.val:\n        root.left = insert_bst(root.left, val)\n    else:\n        root.right = insert_bst(root.right, val)\n    return root\n```\n\n```java\n// Java — BST insert\nTreeNode insertBST(TreeNode root, int val) {\n    if (root == null) return new TreeNode(val);\n    if (val < root.val) root.left = insertBST(root.left, val);\n    else root.right = insertBST(root.right, val);\n    return root;\n}\n```\n\n```javascript\n// JavaScript — BST insert\nfunction insertBST(root, val) {\n    if (!root) return new TreeNode(val);\n    if (val < root.val) root.left = insertBST(root.left, val);\n    else root.right = insertBST(root.right, val);\n    return root;\n}\n```\n\n```cpp\n// C++ — BST insert\nTreeNode* insertBST(TreeNode* root, int val) {\n    if (!root) return new TreeNode(val);\n    if (val < root->val) root->left = insertBST(root->left, val);\n    else root->right = insertBST(root->right, val);\n    return root;\n}\n```\n\n### Deletion — O(h)\n\nThree cases: (1) leaf node — just remove, (2) one child — replace with child, (3) two children — replace with in-order successor (smallest in right subtree) then delete the successor.\n\n```python\n# Python — BST delete\ndef delete_bst(root, key):\n    if not root: return None\n    if key < root.val:\n        root.left = delete_bst(root.left, key)\n    elif key > root.val:\n        root.right = delete_bst(root.right, key)\n    else:\n        if not root.left: return root.right\n        if not root.right: return root.left\n        # Two children: find in-order successor\n        successor = root.right\n        while successor.left:\n            successor = successor.left\n        root.val = successor.val\n        root.right = delete_bst(root.right, successor.val)\n    return root\n```\n\n### Validate BST\n\n```python\n# Python — Validate BST\ndef is_valid_bst(root, lo=float(\'-inf\'), hi=float(\'inf\')):\n    if not root: return True\n    if root.val <= lo or root.val >= hi: return False\n    return (is_valid_bst(root.left, lo, root.val) and\n            is_valid_bst(root.right, root.val, hi))\n```',
      },
      {
        heading: 'Common Tree Patterns & Techniques',
        content:
          '### Pattern 1: Max/Min Depth (Recursive DFS)\n\n```python\n# Python — Maximum depth of binary tree\ndef max_depth(root):\n    if not root: return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))\n```\n\n### Pattern 2: Path Sum\n\nTrack cumulative sums during traversal:\n\n```python\n# Python — Has path sum?\ndef has_path_sum(root, target):\n    if not root: return False\n    if not root.left and not root.right:\n        return root.val == target\n    return (has_path_sum(root.left, target - root.val) or\n            has_path_sum(root.right, target - root.val))\n```\n\n### Pattern 3: Lowest Common Ancestor (LCA)\n\nFor a binary tree (not necessarily BST), the LCA of nodes p and q is the deepest node that has both p and q as descendants:\n\n```python\n# Python — LCA of binary tree\ndef lowest_common_ancestor(root, p, q):\n    if not root or root == p or root == q:\n        return root\n    left = lowest_common_ancestor(root.left, p, q)\n    right = lowest_common_ancestor(root.right, p, q)\n    if left and right: return root\n    return left or right\n```\n\n### Pattern 4: Serialize / Deserialize\n\nConvert a tree to a string and reconstruct it — essential for storing trees in databases or sending across a network.\n\n### Pattern 5: Construct Tree from Traversals\n\nGiven in-order and pre-order arrays, you can uniquely reconstruct the binary tree. The first element of pre-order is the root; find it in in-order to split left and right subtrees.\n\n### Pattern 6: Level-Order Patterns\n\nMany problems use BFS with level tracking:\n- **Right Side View** — last node of each level.\n- **Zigzag Level Order** — alternate direction each level.\n- **Average of Levels** — average value per level.',
      },
      {
        heading: 'Worked Example: BST Insertion and In-Order Traversal',
        content:
          'Let’s build a BST by inserting the values `[8, 3, 10, 1, 6, 14]` one at a time, then perform an in-order traversal.\n\n### Step-by-Step Insertion\n\n**Insert 8:** Tree is empty, 8 becomes the root.\n```\n    8\n```\n\n**Insert 3:** 3 < 8, go left. Left is empty, attach.\n```\n    8\n   /\n  3\n```\n\n**Insert 10:** 10 > 8, go right. Right is empty, attach.\n```\n      8\n     / \\\n    3   10\n```\n\n**Insert 1:** 1 < 8 → go left → 1 < 3 → go left. Attach.\n```\n      8\n     / \\\n    3   10\n   /\n  1\n```\n\n**Insert 6:** 6 < 8 → go left → 6 > 3 → go right. Attach.\n```\n      8\n     / \\\n    3   10\n   / \\\n  1   6\n```\n\n**Insert 14:** 14 > 8 → go right → 14 > 10 → go right. Attach.\n```\n      8\n     / \\\n    3   10\n   / \\    \\\n  1   6    14\n```\n\n### In-Order Traversal Trace\n\nIn-order visits: Left → Root → Right.\n\n```\nCall inorder(8)\n  Call inorder(3)\n    Call inorder(1)\n      Call inorder(null) → return\n      Visit 1\n      Call inorder(null) → return\n    Visit 3\n    Call inorder(6)\n      Call inorder(null) → return\n      Visit 6\n      Call inorder(null) → return\n  Visit 8\n  Call inorder(10)\n    Call inorder(null) → return\n    Visit 10\n    Call inorder(14)\n      Call inorder(null) → return\n      Visit 14\n      Call inorder(null) → return\n```\n\n**Output:** `[1, 3, 6, 8, 10, 14]` — sorted! This is the fundamental property of in-order traversal on a BST.',
      },
      {
        heading: 'Worked Example: Lowest Common Ancestor',
        content:
          'Given this binary tree, find the LCA of nodes 5 and 1:\n\n```\n        3\n       / \\\n      5   1\n     / \\ / \\\n    6  2 0  8\n      / \\\n     7   4\n```\n\n### Trace of the Recursive LCA Algorithm\n\n```\nlca(3, 5, 1):\n    root=3 is not null, not 5, not 1\n    left  = lca(5, 5, 1)\n        root=5 is 5! Return 5\n    right = lca(1, 5, 1)\n        root=1 is 1! Return 1\n    left=5 and right=1 → both non-null\n    Return root=3\n```\n\n**Result:** The LCA of 5 and 1 is **3** ✓\n\n### Another Example: LCA of 5 and 4\n\n```\nlca(3, 5, 4):\n    left  = lca(5, 5, 4)\n        root=5 is 5! Return 5\n    right = lca(1, 5, 4)\n        left  = lca(0, 5, 4) → null\n        right = lca(8, 5, 4) → null\n        Return null\n    left=5, right=null\n    Return left=5\n```\n\n**Result:** The LCA of 5 and 4 is **5** ✓ (a node can be an ancestor of itself).\n\n### Key Insight\n\nThe algorithm works by propagating information upward: if a subtree contains one target, it returns that target. If a node receives non-null results from **both** subtrees, it must be the LCA. If only one side is non-null, that side already contains the LCA. This elegant recursion handles all cases in O(n) time and O(h) space.',
      },
      {
        heading: 'Balanced BSTs & Self-Balancing Trees',
        content:
          '### The Problem: Degenerate Trees\n\nIf you insert sorted data `[1, 2, 3, 4, 5]` into a BST, you get a linked-list-shaped tree — every node has only a right child. The height becomes O(n) and all operations degrade to O(n).\n\n```\n1\n \\\n  2\n   \\\n    3\n     \\\n      4\n       \\\n        5\n```\n\n### Self-Balancing BSTs\n\nSelf-balancing trees maintain O(log n) height through rotations:\n\n**AVL Trees** — Strict balance: the height of left and right subtrees differs by at most 1. After each insertion/deletion, perform rotations (left, right, left-right, right-left) to restore balance. Guarantees O(log n) for all operations.\n\n**Red-Black Trees** — Relaxed balance using node coloring rules. Used in Java’s `TreeMap`, C++’s `std::map`, and Linux’s CFS scheduler. Slightly faster insertions than AVL due to fewer rotations, but slightly slower lookups.\n\n### Rotations\n\nA **right rotation** at node `y`:\n```\n    y              x\n   / \\    →      / \\\n  x   C        A   y\n / \\              / \\\nA   B            B   C\n```\n\nA **left rotation** at node `x`:\n```\n  x                y\n / \\      →      / \\\nA   y            x   C\n   / \\          / \\\n  B   C        A   B\n```\n\n### Complexity Comparison\n\n| Tree Type | Search | Insert | Delete | Space |\n|-----------|--------|--------|--------|-------|\n| BST (unbalanced) | O(n) worst | O(n) worst | O(n) worst | O(n) |\n| AVL Tree | O(log n) | O(log n) | O(log n) | O(n) |\n| Red-Black Tree | O(log n) | O(log n) | O(log n) | O(n) |\n\n### For Interviews\n\nYou rarely need to implement AVL or Red-Black trees from scratch. However, you should:\n1. Know **why** balancing matters (prevents O(n) degeneration).\n2. Understand that `TreeMap` (Java) / `map` (C++) / `SortedList` (Python) use balanced BSTs internally.\n3. Be able to explain rotations conceptually.',
      },
      {
        heading: 'Common Interview Problems & Solution Approaches',
        content:
          '### Easy\n- **Maximum Depth of Binary Tree** (LeetCode 104) — Recursive DFS: `1 + max(depth(left), depth(right))`. O(n).\n- **Invert Binary Tree** (LeetCode 226) — Swap left and right children recursively. O(n).\n- **Same Tree** (LeetCode 100) — Compare both trees recursively. O(n).\n- **Symmetric Tree** (LeetCode 101) — Mirror check: compare left.left with right.right. O(n).\n- **Path Sum** (LeetCode 112) — DFS subtracting node values. O(n).\n\n### Medium\n- **Binary Tree Level Order Traversal** (LeetCode 102) — BFS with level tracking. O(n).\n- **Validate BST** (LeetCode 98) — Recursive with min/max bounds. O(n).\n- **Lowest Common Ancestor** (LeetCode 236) — Recursive propagation. O(n).\n- **Construct Binary Tree from Preorder and Inorder** (LeetCode 105) — Divide root, split arrays. O(n).\n- **Kth Smallest Element in BST** (LeetCode 230) — In-order traversal, return kth element. O(h + k).\n- **Binary Tree Right Side View** (LeetCode 199) — BFS, take last node per level. O(n).\n- **Serialize and Deserialize Binary Tree** (LeetCode 297) — Pre-order with null markers. O(n).\n\n### Hard\n- **Binary Tree Maximum Path Sum** (LeetCode 124) — DFS tracking max-gain per subtree. O(n).\n- **Vertical Order Traversal** (LeetCode 987) — BFS with column index tracking. O(n log n).\n\n### Interview Tips\n\n1. Most tree problems are solved with **DFS (recursion)** — think "what does this node need from its children?"\n2. Use **BFS** when the problem involves levels, distance from root, or shortest path.\n3. Always handle the **null base case** first in recursive solutions.\n4. For BST problems, leverage the ordering property to prune search space.\n5. Draw the tree and trace your algorithm by hand before coding.',
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
      'A graph is a collection of vertices (nodes) connected by edges, forming the most general and flexible data structure for modeling relationships. Graphs can represent social networks, road maps, dependency chains, web page links, and countless other real-world systems. They can be directed or undirected, weighted or unweighted, cyclic or acyclic — and choosing the right representation and algorithm is a core interview skill. Graph problems are considered among the hardest in technical interviews, but they follow recognizable patterns: BFS for shortest paths in unweighted graphs, DFS for cycle detection and topological ordering, Dijkstra’s for weighted shortest paths, and Union-Find for dynamic connectivity. In this deep-dive, we explore graph representations, implement BFS and DFS in four languages, study advanced algorithms with code, trace through worked examples step by step, and survey the essential interview patterns.',
    sections: [
      {
        heading: 'Graph Fundamentals & Representations',
        content:
          '### Key Terminology\n\n- **Vertex (node)** — a fundamental unit of a graph.\n- **Edge** — a connection between two vertices. Can be **directed** (one-way) or **undirected** (two-way).\n- **Weighted** — edges carry a cost/distance value.\n- **Degree** — number of edges connected to a vertex. In directed graphs: **in-degree** (incoming) and **out-degree** (outgoing).\n- **Path** — a sequence of vertices connected by edges.\n- **Cycle** — a path that starts and ends at the same vertex.\n- **DAG** — Directed Acyclic Graph (no cycles). Essential for topological sort.\n- **Connected** — every vertex can reach every other vertex (undirected). **Strongly connected** — same for directed graphs.\n\n### Three Representations\n\n**1. Adjacency List** — Each vertex stores a list of its neighbors.\n- Space: O(V + E). Efficient for sparse graphs.\n- Check if edge exists: O(degree).\n\n**2. Adjacency Matrix** — V x V matrix where `matrix[i][j] = 1` if edge from i to j.\n- Space: O(V²). Efficient for dense graphs.\n- Check if edge exists: O(1).\n\n**3. Edge List** — A simple list of `(u, v, weight)` tuples.\n- Space: O(E). Useful for Kruskal’s MST algorithm.\n\n### Comparison\n\n| Operation | Adj List | Adj Matrix | Edge List |\n|-----------|----------|------------|-----------|\n| Space | O(V + E) | O(V²) | O(E) |\n| Add edge | O(1) | O(1) | O(1) |\n| Check edge | O(degree) | O(1) | O(E) |\n| Get neighbors | O(degree) | O(V) | O(E) |\n| Best for | Sparse | Dense | Kruskal’s |\n\nMost interview problems use **adjacency lists** because real-world graphs are typically sparse.',
      },
      {
        heading: 'Building Graphs in Four Languages',
        content:
          'Most interview problems give you an edge list and ask you to build a graph. Here is how to do it in each language:\n\n```python\n# Python — Build adjacency list from edge list\nfrom collections import defaultdict\n\ndef build_graph(n, edges):\n    graph = defaultdict(list)\n    for u, v in edges:\n        graph[u].append(v)\n        graph[v].append(u)  # omit for directed\n    return graph\n\n# Weighted graph\ndef build_weighted_graph(n, edges):\n    graph = defaultdict(list)\n    for u, v, w in edges:\n        graph[u].append((v, w))\n        graph[v].append((u, w))\n    return graph\n```\n\n```java\n// Java — Build adjacency list\nimport java.util.*;\n\nList<List<Integer>> buildGraph(int n, int[][] edges) {\n    List<List<Integer>> graph = new ArrayList<>();\n    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());\n    for (int[] e : edges) {\n        graph.get(e[0]).add(e[1]);\n        graph.get(e[1]).add(e[0]); // omit for directed\n    }\n    return graph;\n}\n```\n\n```javascript\n// JavaScript — Build adjacency list\nfunction buildGraph(n, edges) {\n    const graph = Array.from({length: n}, () => []);\n    for (const [u, v] of edges) {\n        graph[u].push(v);\n        graph[v].push(u); // omit for directed\n    }\n    return graph;\n}\n```\n\n```cpp\n// C++ — Build adjacency list\n#include <vector>\nusing namespace std;\n\nvector<vector<int>> buildGraph(int n, vector<vector<int>>& edges) {\n    vector<vector<int>> graph(n);\n    for (auto& e : edges) {\n        graph[e[0]].push_back(e[1]);\n        graph[e[1]].push_back(e[0]); // omit for directed\n    }\n    return graph;\n}\n```\n\n### Building from a 2D Grid\n\nMany graph problems use a 2D grid as an implicit graph. Each cell is a node; neighbors are the 4 (or 8) adjacent cells:\n\n```python\n# Python — 4-directional neighbors in a grid\ndef get_neighbors(r, c, rows, cols):\n    directions = [(0,1),(0,-1),(1,0),(-1,0)]\n    for dr, dc in directions:\n        nr, nc = r + dr, c + dc\n        if 0 <= nr < rows and 0 <= nc < cols:\n            yield nr, nc\n```',
      },
      {
        heading: 'BFS & DFS in Four Languages',
        content:
          '### Breadth-First Search (BFS)\n\nBFS explores nodes level by level using a **queue**. It guarantees the **shortest path** in unweighted graphs.\n\n```python\n# Python — BFS\nfrom collections import deque\n\ndef bfs(graph, start):\n    visited = {start}\n    queue = deque([start])\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    return order\n```\n\n```java\n// Java — BFS\nList<Integer> bfs(List<List<Integer>> graph, int start) {\n    List<Integer> order = new ArrayList<>();\n    boolean[] visited = new boolean[graph.size()];\n    Queue<Integer> queue = new LinkedList<>();\n    visited[start] = true;\n    queue.add(start);\n    while (!queue.isEmpty()) {\n        int node = queue.poll();\n        order.add(node);\n        for (int neighbor : graph.get(node)) {\n            if (!visited[neighbor]) {\n                visited[neighbor] = true;\n                queue.add(neighbor);\n            }\n        }\n    }\n    return order;\n}\n```\n\n```javascript\n// JavaScript — BFS\nfunction bfs(graph, start) {\n    const visited = new Set([start]);\n    const queue = [start];\n    const order = [];\n    while (queue.length > 0) {\n        const node = queue.shift();\n        order.push(node);\n        for (const neighbor of graph[node]) {\n            if (!visited.has(neighbor)) {\n                visited.add(neighbor);\n                queue.push(neighbor);\n            }\n        }\n    }\n    return order;\n}\n```\n\n```cpp\n// C++ — BFS\n#include <queue>\nvector<int> bfs(vector<vector<int>>& graph, int start) {\n    vector<int> order;\n    vector<bool> visited(graph.size(), false);\n    queue<int> q;\n    visited[start] = true;\n    q.push(start);\n    while (!q.empty()) {\n        int node = q.front(); q.pop();\n        order.push_back(node);\n        for (int neighbor : graph[node]) {\n            if (!visited[neighbor]) {\n                visited[neighbor] = true;\n                q.push(neighbor);\n            }\n        }\n    }\n    return order;\n}\n```\n\n### Depth-First Search (DFS)\n\nDFS explores as deep as possible before backtracking. Use it for cycle detection, topological sort, and connected components.\n\n```python\n# Python — DFS (iterative)\ndef dfs(graph, start):\n    visited = {start}\n    stack = [start]\n    order = []\n    while stack:\n        node = stack.pop()\n        order.append(node)\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                stack.append(neighbor)\n    return order\n\n# Python — DFS (recursive)\ndef dfs_recursive(graph, node, visited=None):\n    if visited is None:\n        visited = set()\n    visited.add(node)\n    for neighbor in graph[node]:\n        if neighbor not in visited:\n            dfs_recursive(graph, neighbor, visited)\n```\n\n### When to Use Which?\n\n| | BFS | DFS |\n|---|-----|-----|\n| Data structure | Queue | Stack / Recursion |\n| Shortest path (unweighted) | **Yes** | No |\n| Cycle detection | Yes | **Yes** (easier) |\n| Topological sort | Kahn’s (BFS) | **Yes** (reverse post-order) |\n| Connected components | Yes | **Yes** |\n| Space (worst case) | O(V) | O(V) |',
      },
      {
        heading: 'Topological Sort & Cycle Detection',
        content:
          '### Topological Sort\n\nA topological ordering of a DAG is a linear ordering of vertices such that for every directed edge u → v, vertex u appears before v. Used for: course scheduling, build systems, task dependencies.\n\n**Kahn’s Algorithm (BFS-based):**\n\n```python\n# Python — Topological sort (Kahn’s algorithm)\nfrom collections import deque\n\ndef topological_sort(n, edges):\n    graph = [[] for _ in range(n)]\n    in_degree = [0] * n\n    for u, v in edges:\n        graph[u].append(v)\n        in_degree[v] += 1\n\n    queue = deque([i for i in range(n) if in_degree[i] == 0])\n    order = []\n    while queue:\n        node = queue.popleft()\n        order.append(node)\n        for neighbor in graph[node]:\n            in_degree[neighbor] -= 1\n            if in_degree[neighbor] == 0:\n                queue.append(neighbor)\n\n    return order if len(order) == n else []  # empty = cycle detected\n```\n\n```java\n// Java — Topological sort (Kahn’s)\nList<Integer> topologicalSort(int n, int[][] edges) {\n    List<List<Integer>> graph = new ArrayList<>();\n    int[] inDegree = new int[n];\n    for (int i = 0; i < n; i++) graph.add(new ArrayList<>());\n    for (int[] e : edges) {\n        graph.get(e[0]).add(e[1]);\n        inDegree[e[1]]++;\n    }\n    Queue<Integer> queue = new LinkedList<>();\n    for (int i = 0; i < n; i++)\n        if (inDegree[i] == 0) queue.add(i);\n    List<Integer> order = new ArrayList<>();\n    while (!queue.isEmpty()) {\n        int node = queue.poll();\n        order.add(node);\n        for (int nb : graph.get(node))\n            if (--inDegree[nb] == 0) queue.add(nb);\n    }\n    return order.size() == n ? order : List.of();\n}\n```\n\n### Cycle Detection\n\n**Undirected graph** — DFS: if you visit a node that is already visited and is NOT the parent, there is a cycle.\n\n**Directed graph** — DFS with 3-color marking:\n- **White** (unvisited), **Gray** (in current DFS path), **Black** (fully processed).\n- If you encounter a **gray** node, there is a cycle (back edge).\n\n```python\n# Python — Cycle detection in directed graph\ndef has_cycle(n, edges):\n    graph = [[] for _ in range(n)]\n    for u, v in edges:\n        graph[u].append(v)\n\n    WHITE, GRAY, BLACK = 0, 1, 2\n    color = [WHITE] * n\n\n    def dfs(node):\n        color[node] = GRAY\n        for neighbor in graph[node]:\n            if color[neighbor] == GRAY:\n                return True  # back edge = cycle\n            if color[neighbor] == WHITE and dfs(neighbor):\n                return True\n        color[node] = BLACK\n        return False\n\n    return any(color[i] == WHITE and dfs(i) for i in range(n))\n```',
      },
      {
        heading: 'Shortest Path Algorithms: Dijkstra’s & Bellman-Ford',
        content:
          '### Dijkstra’s Algorithm\n\nFinds the shortest path from a source to all other vertices in a **non-negative weighted** graph. Uses a min-heap (priority queue).\n\n**Time:** O((V + E) log V) with a binary heap.\n\n```python\n# Python — Dijkstra’s algorithm\nimport heapq\n\ndef dijkstra(graph, start, n):\n    dist = [float(\'inf\')] * n\n    dist[start] = 0\n    heap = [(0, start)]  # (distance, node)\n\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d > dist[u]:\n            continue  # skip outdated entry\n        for v, w in graph[u]:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n                heapq.heappush(heap, (dist[v], v))\n    return dist\n```\n\n```java\n// Java — Dijkstra’s algorithm\nint[] dijkstra(List<List<int[]>> graph, int start, int n) {\n    int[] dist = new int[n];\n    Arrays.fill(dist, Integer.MAX_VALUE);\n    dist[start] = 0;\n    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);\n    pq.offer(new int[]{0, start});\n    while (!pq.isEmpty()) {\n        int[] top = pq.poll();\n        int d = top[0], u = top[1];\n        if (d > dist[u]) continue;\n        for (int[] edge : graph.get(u)) {\n            int v = edge[0], w = edge[1];\n            if (dist[u] + w < dist[v]) {\n                dist[v] = dist[u] + w;\n                pq.offer(new int[]{dist[v], v});\n            }\n        }\n    }\n    return dist;\n}\n```\n\n### Bellman-Ford Algorithm\n\nHandles **negative edge weights** (but not negative cycles). Relaxes all edges V-1 times.\n\n**Time:** O(V * E).\n\n```python\n# Python — Bellman-Ford\ndef bellman_ford(n, edges, start):\n    dist = [float(\'inf\')] * n\n    dist[start] = 0\n    for _ in range(n - 1):\n        for u, v, w in edges:\n            if dist[u] != float(\'inf\') and dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    # Check for negative cycle\n    for u, v, w in edges:\n        if dist[u] != float(\'inf\') and dist[u] + w < dist[v]:\n            return None  # negative cycle exists\n    return dist\n```\n\n### Comparison\n\n| Algorithm | Weights | Negative Edges? | Time Complexity |\n|-----------|---------|-----------------|-----------------|\n| BFS | Unweighted | N/A | O(V + E) |\n| Dijkstra’s | Non-negative | No | O((V+E) log V) |\n| Bellman-Ford | Any | Yes (detects neg cycles) | O(V * E) |\n| Floyd-Warshall | Any | Yes | O(V³) |',
      },
      {
        heading: 'Union-Find (Disjoint Set Union)',
        content:
          'Union-Find tracks a collection of disjoint sets and supports two operations:\n- **Find(x)** — which set does x belong to?\n- **Union(x, y)** — merge the sets containing x and y.\n\nWith **path compression** and **union by rank**, both operations are nearly O(1) — specifically O(α(n)) where α is the inverse Ackermann function.\n\n```python\n# Python — Union-Find with path compression and union by rank\nclass UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n        self.count = n  # number of connected components\n\n    def find(self, x):\n        if self.parent[x] != x:\n            self.parent[x] = self.find(self.parent[x])  # path compression\n        return self.parent[x]\n\n    def union(self, x, y):\n        px, py = self.find(x), self.find(y)\n        if px == py:\n            return False  # already connected\n        if self.rank[px] < self.rank[py]:\n            px, py = py, px\n        self.parent[py] = px  # union by rank\n        if self.rank[px] == self.rank[py]:\n            self.rank[px] += 1\n        self.count -= 1\n        return True\n```\n\n```java\n// Java — Union-Find\nclass UnionFind {\n    int[] parent, rank;\n    int count;\n    UnionFind(int n) {\n        parent = new int[n]; rank = new int[n]; count = n;\n        for (int i = 0; i < n; i++) parent[i] = i;\n    }\n    int find(int x) {\n        if (parent[x] != x) parent[x] = find(parent[x]);\n        return parent[x];\n    }\n    boolean union(int x, int y) {\n        int px = find(x), py = find(y);\n        if (px == py) return false;\n        if (rank[px] < rank[py]) { int t = px; px = py; py = t; }\n        parent[py] = px;\n        if (rank[px] == rank[py]) rank[px]++;\n        count--;\n        return true;\n    }\n}\n```\n\n### Common Uses\n\n- **Number of connected components** — initialize UF with n nodes, union for each edge, return `uf.count`.\n- **Redundant Connection** (LeetCode 684) — find the edge that creates a cycle (union returns false).\n- **Accounts Merge** (LeetCode 721) — group accounts that share emails.\n- **Kruskal’s MST** — sort edges by weight, union endpoints, skip if same component.',
      },
      {
        heading: 'Worked Example: BFS Shortest Path',
        content:
          'Find the shortest path from node 0 to node 5 in this unweighted graph:\n\n```\n0 — 1 — 3\n|       |\n2 — 4 — 5\n```\n\nEdges: `[[0,1],[0,2],[1,3],[2,4],[3,5],[4,5]]`\n\n### BFS Trace\n\n| Step | Queue | Visited | Action |\n|------|-------|---------|--------|\n| Init | [0] | {0} | Start at 0 |\n| 1 | [1, 2] | {0, 1, 2} | Dequeue 0. Enqueue neighbors 1, 2 |\n| 2 | [2, 3] | {0, 1, 2, 3} | Dequeue 1. Enqueue neighbor 3 (0 already visited) |\n| 3 | [3, 4] | {0, 1, 2, 3, 4} | Dequeue 2. Enqueue neighbor 4 (0 already visited) |\n| 4 | [4, 5] | {0, 1, 2, 3, 4, 5} | Dequeue 3. Enqueue neighbor 5 (1 already visited) |\n| 5 | [5] | {0, 1, 2, 3, 4, 5} | Dequeue 4. 5 already visited, 2 already visited |\n| 6 | [] | {0, 1, 2, 3, 4, 5} | Dequeue 5. Done! |\n\n### Distance Table\n\nTo track distances, store the distance when enqueuing:\n\n| Node | Distance from 0 | Path |\n|------|-----------------|------|\n| 0 | 0 | [0] |\n| 1 | 1 | [0, 1] |\n| 2 | 1 | [0, 2] |\n| 3 | 2 | [0, 1, 3] |\n| 4 | 2 | [0, 2, 4] |\n| 5 | 3 | [0, 1, 3, 5] or [0, 2, 4, 5] |\n\n**Shortest path from 0 to 5:** distance = **3**.\n\n### Why BFS Guarantees Shortest Path\n\nBFS explores all nodes at distance `d` before any node at distance `d+1`. So the first time we reach a node, we reached it via the shortest possible path. This only works for **unweighted** graphs (or graphs where all edges have equal weight). For weighted graphs, use Dijkstra’s algorithm instead.',
      },
      {
        heading: 'Common Interview Problems & Solution Approaches',
        content:
          '### Easy / Medium\n- **Number of Islands** (LeetCode 200) — DFS/BFS flood fill on 2D grid. O(m*n).\n- **Clone Graph** (LeetCode 133) — BFS/DFS with hash map mapping old nodes to new nodes. O(V + E).\n- **Flood Fill** (LeetCode 733) — DFS from the starting pixel. O(m*n).\n\n### Medium\n- **Course Schedule** (LeetCode 207) — Detect cycle in directed graph with topological sort. O(V + E).\n- **Course Schedule II** (LeetCode 210) — Return topological order or empty if cycle. O(V + E).\n- **Number of Connected Components** (LeetCode 323) — Union-Find or DFS. O(V + E).\n- **Pacific Atlantic Water Flow** (LeetCode 417) — BFS/DFS from each ocean inward. O(m*n).\n- **Rotting Oranges** (LeetCode 994) — Multi-source BFS from all rotten oranges. O(m*n).\n- **Word Ladder** (LeetCode 127) — BFS with word transformation as edges. O(n * L²).\n- **Surrounded Regions** (LeetCode 130) — DFS from border O’s, then flip remaining. O(m*n).\n- **Graph Valid Tree** (LeetCode 261) — Union-Find: n-1 edges and no cycle. O(V + E).\n- **Redundant Connection** (LeetCode 684) — Union-Find to detect the cycle-creating edge. O(V).\n\n### Hard\n- **Network Delay Time** (LeetCode 743) — Dijkstra’s for shortest path to all nodes. O((V+E) log V).\n- **Alien Dictionary** (LeetCode 269) — Build graph from word order, topological sort. O(C) where C = total characters.\n- **Word Ladder II** (LeetCode 126) — BFS for shortest distance + DFS to reconstruct all paths. O(n * L²).\n- **Minimum Cost to Connect All Points** (LeetCode 1584) — Prim’s or Kruskal’s MST. O(n² log n).\n\n### Interview Tips\n\n1. **Identify the graph** — many problems are graphs in disguise (grids, word transformations, dependencies).\n2. **Choose BFS vs. DFS** — BFS for shortest path / levels, DFS for cycle detection / topological sort / backtracking.\n3. **Build the adjacency list first** — always start by converting the input into a graph representation.\n4. **Track visited nodes** — forgetting this causes infinite loops.\n5. **Consider Union-Find** for connectivity problems — it is often simpler and faster than DFS.',
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
      'Dynamic Programming (DP) is an algorithmic technique for solving optimization problems by breaking them into smaller overlapping subproblems, solving each subproblem once, and caching the results to avoid redundant computation. It is arguably the most feared topic in coding interviews yet also one of the most tested, appearing in roughly 20 percent of medium and hard problems on LeetCode. The two prerequisites for applying DP are optimal substructure (the optimal solution builds upon optimal solutions to subproblems) and overlapping subproblems (the same subproblems recur many times in a naive recursive approach). In this comprehensive guide, we dissect the two main DP approaches — top-down memoization and bottom-up tabulation — implement classic problems in four languages, walk through a systematic 5-step framework, trace through worked examples with detailed state tables, and survey the major DP patterns you need to master for interviews.',
    sections: [
      {
        heading: 'What Makes a Problem DP? Optimal Substructure & Overlapping Subproblems',
        content:
          '### The Two Pillars of DP\n\n**1. Optimal Substructure:** The optimal solution to the problem can be constructed from optimal solutions to its subproblems. For example, the shortest path from A to C through B is the shortest path from A to B plus the shortest path from B to C.\n\n**2. Overlapping Subproblems:** A naive recursive solution solves the same subproblems many times. For example, computing `fib(5)` recursively computes `fib(3)` twice, `fib(2)` three times, etc.\n\n### Fibonacci: The Canonical Example\n\n```\n                    fib(5)\n                   /      \\\n              fib(4)       fib(3)\n             /     \\       /    \\\n         fib(3)  fib(2) fib(2) fib(1)\n        /    \\\n    fib(2) fib(1)\n```\n\nWithout caching, `fib(n)` has **O(2^n)** time complexity because the recursion tree branches exponentially. With DP (caching), each subproblem is solved once: **O(n)** time, O(n) space.\n\n### DP vs. Greedy vs. Divide and Conquer\n\n| Technique | Subproblems | Overlap? | Approach |\n|-----------|-------------|----------|----------|\n| DP | Many, overlapping | Yes | Cache results |\n| Greedy | None (local optimal) | N/A | Make best local choice |\n| Divide & Conquer | Independent | No | Solve separately, combine |\n\nDP is needed when greedy fails (no local optimal guarantees global optimal) and subproblems overlap (divide-and-conquer would recompute them).',
      },
      {
        heading: 'Top-Down vs. Bottom-Up in Four Languages',
        content:
          '### Top-Down (Memoization)\n\nWrite a natural recursive solution, then add a cache to avoid recomputation.\n\n```python\n# Python — Fibonacci with memoization\ndef fib(n, memo={}):\n    if n <= 1: return n\n    if n in memo: return memo[n]\n    memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]\n```\n\n```java\n// Java — Fibonacci with memoization\nint[] memo;\nint fib(int n) {\n    if (n <= 1) return n;\n    if (memo == null) memo = new int[n + 1];\n    if (memo[n] != 0) return memo[n];\n    return memo[n] = fib(n - 1) + fib(n - 2);\n}\n```\n\n```javascript\n// JavaScript — Fibonacci with memoization\nfunction fib(n, memo = {}) {\n    if (n <= 1) return n;\n    if (memo[n] !== undefined) return memo[n];\n    memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n    return memo[n];\n}\n```\n\n```cpp\n// C++ — Fibonacci with memoization\nunordered_map<int, int> memo;\nint fib(int n) {\n    if (n <= 1) return n;\n    if (memo.count(n)) return memo[n];\n    return memo[n] = fib(n - 1) + fib(n - 2);\n}\n```\n\n### Bottom-Up (Tabulation)\n\nBuild the solution table from base cases upward, eliminating recursion entirely.\n\n```python\n# Python — Fibonacci bottom-up\ndef fib_bottom_up(n):\n    if n <= 1: return n\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i - 1] + dp[i - 2]\n    return dp[n]\n```\n\n### Space-Optimized Bottom-Up\n\nWhen the recurrence depends on only the last few states, reduce space from O(n) to O(1):\n\n```python\n# Python — Fibonacci O(1) space\ndef fib_optimized(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b\n```\n\n### Comparison\n\n| Approach | Pros | Cons |\n|----------|------|------|\n| Top-Down | Natural to write, only solves needed subproblems | Recursion overhead, stack limit |\n| Bottom-Up | No recursion, easier to optimize space | Must determine computation order |',
      },
      {
        heading: 'The 5-Step DP Framework',
        content:
          'Use this systematic framework to solve any DP problem:\n\n### Step 1: Define the State\n\nWhat information uniquely identifies a subproblem? This becomes your DP array index.\n\n- **1D:** `dp[i]` = answer for the first i elements.\n- **2D:** `dp[i][j]` = answer for substring s[i..j] or using items 0..i with capacity j.\n\n### Step 2: Define the Recurrence\n\nHow does `dp[i]` relate to smaller subproblems? This is the heart of any DP solution.\n\n**Example (Climbing Stairs):** `dp[i] = dp[i-1] + dp[i-2]` — you can reach step i from step i-1 (one step) or step i-2 (two steps).\n\n### Step 3: Identify Base Cases\n\nWhat are the trivially solvable subproblems?\n\n**Example:** `dp[0] = 1` (one way to stay at ground), `dp[1] = 1` (one way to reach step 1).\n\n### Step 4: Determine Computation Order\n\nBottom-up: compute smaller subproblems before larger ones. For 1D, iterate left to right. For 2D, it depends on the recurrence.\n\n### Step 5: Optimize Space\n\nIf `dp[i]` only depends on `dp[i-1]` and `dp[i-2]`, use two variables instead of an array.\n\n### Applying the Framework: Climbing Stairs\n\n```python\n# Python — Climbing Stairs\ndef climb_stairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b\n```\n\n```java\n// Java — Climbing Stairs\nint climbStairs(int n) {\n    if (n <= 2) return n;\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; i++) {\n        int temp = b;\n        b = a + b;\n        a = temp;\n    }\n    return b;\n}\n```\n\n```javascript\n// JavaScript — Climbing Stairs\nfunction climbStairs(n) {\n    if (n <= 2) return n;\n    let a = 1, b = 2;\n    for (let i = 3; i <= n; i++) {\n        [a, b] = [b, a + b];\n    }\n    return b;\n}\n```\n\n```cpp\n// C++ — Climbing Stairs\nint climbStairs(int n) {\n    if (n <= 2) return n;\n    int a = 1, b = 2;\n    for (int i = 3; i <= n; i++) {\n        int temp = b;\n        b = a + b;\n        a = temp;\n    }\n    return b;\n}\n```',
      },
      {
        heading: '1D DP: Classic Problems with Code',
        content:
          '### House Robber\n\nYou cannot rob two adjacent houses. Maximize the total amount:\n\n**State:** `dp[i]` = max money robbing from houses 0..i.\n**Recurrence:** `dp[i] = max(dp[i-1], dp[i-2] + nums[i])` — skip house i or rob it.\n\n```python\n# Python — House Robber\ndef rob(nums):\n    if not nums: return 0\n    if len(nums) == 1: return nums[0]\n    a, b = 0, 0\n    for num in nums:\n        a, b = b, max(b, a + num)\n    return b\n```\n\n```java\n// Java — House Robber\nint rob(int[] nums) {\n    int a = 0, b = 0;\n    for (int num : nums) {\n        int temp = b;\n        b = Math.max(b, a + num);\n        a = temp;\n    }\n    return b;\n}\n```\n\n### Coin Change\n\nFind the minimum number of coins to make amount `target`:\n\n**State:** `dp[a]` = minimum coins needed for amount `a`.\n**Recurrence:** `dp[a] = min(dp[a - coin] + 1)` for each coin denomination.\n\n```python\n# Python — Coin Change\ndef coin_change(coins, amount):\n    dp = [float(\'inf\')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for coin in coins:\n            if coin <= a:\n                dp[a] = min(dp[a], dp[a - coin] + 1)\n    return dp[amount] if dp[amount] != float(\'inf\') else -1\n```\n\n```java\n// Java — Coin Change\nint coinChange(int[] coins, int amount) {\n    int[] dp = new int[amount + 1];\n    Arrays.fill(dp, amount + 1);\n    dp[0] = 0;\n    for (int a = 1; a <= amount; a++)\n        for (int coin : coins)\n            if (coin <= a)\n                dp[a] = Math.min(dp[a], dp[a - coin] + 1);\n    return dp[amount] > amount ? -1 : dp[amount];\n}\n```\n\n### Longest Increasing Subsequence\n\n**State:** `dp[i]` = length of the LIS ending at index `i`.\n**Recurrence:** `dp[i] = max(dp[j] + 1)` for all `j < i` where `nums[j] < nums[i]`.\n\n```python\n# Python — LIS (O(n^2))\ndef length_of_lis(nums):\n    dp = [1] * len(nums)\n    for i in range(1, len(nums)):\n        for j in range(i):\n            if nums[j] < nums[i]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp)\n```',
      },
      {
        heading: '2D DP: Longest Common Subsequence & Grid Paths',
        content:
          '### Longest Common Subsequence (LCS)\n\nGiven two strings, find the length of their longest common subsequence.\n\n**State:** `dp[i][j]` = LCS length of `text1[0..i-1]` and `text2[0..j-1]`.\n**Recurrence:**\n- If `text1[i-1] == text2[j-1]`: `dp[i][j] = dp[i-1][j-1] + 1`\n- Else: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`\n\n```python\n# Python — Longest Common Subsequence\ndef lcs(text1, text2):\n    m, n = len(text1), len(text2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if text1[i-1] == text2[j-1]:\n                dp[i][j] = dp[i-1][j-1] + 1\n            else:\n                dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n    return dp[m][n]\n```\n\n```java\n// Java — LCS\nint lcs(String text1, String text2) {\n    int m = text1.length(), n = text2.length();\n    int[][] dp = new int[m + 1][n + 1];\n    for (int i = 1; i <= m; i++)\n        for (int j = 1; j <= n; j++)\n            if (text1.charAt(i-1) == text2.charAt(j-1))\n                dp[i][j] = dp[i-1][j-1] + 1;\n            else\n                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);\n    return dp[m][n];\n}\n```\n\n### Unique Paths (Grid DP)\n\nCount the number of paths from top-left to bottom-right of an m x n grid, moving only right or down.\n\n```python\n# Python — Unique Paths\ndef unique_paths(m, n):\n    dp = [[1] * n for _ in range(m)]\n    for i in range(1, m):\n        for j in range(1, n):\n            dp[i][j] = dp[i-1][j] + dp[i][j-1]\n    return dp[m-1][n-1]\n```\n\n```cpp\n// C++ — Unique Paths\nint uniquePaths(int m, int n) {\n    vector<vector<int>> dp(m, vector<int>(n, 1));\n    for (int i = 1; i < m; i++)\n        for (int j = 1; j < n; j++)\n            dp[i][j] = dp[i-1][j] + dp[i][j-1];\n    return dp[m-1][n-1];\n}\n```\n\n### 0/1 Knapsack\n\nGiven items with weights and values, maximize value within a weight capacity.\n\n```python\n# Python — 0/1 Knapsack\ndef knapsack(weights, values, capacity):\n    n = len(weights)\n    dp = [[0] * (capacity + 1) for _ in range(n + 1)]\n    for i in range(1, n + 1):\n        for w in range(capacity + 1):\n            dp[i][w] = dp[i-1][w]\n            if weights[i-1] <= w:\n                dp[i][w] = max(dp[i][w], dp[i-1][w-weights[i-1]] + values[i-1])\n    return dp[n][capacity]\n```',
      },
      {
        heading: 'Worked Example: Coin Change Step by Step',
        content:
          '**Problem:** Given coins `[1, 3, 4]` and amount `6`, find the minimum number of coins.\n\n### Building the DP Table\n\n`dp[a]` = minimum coins needed for amount `a`. Initialize: `dp[0] = 0`, all others = infinity.\n\nFor each amount from 1 to 6, try every coin:\n\n| Amount | Try coin=1 | Try coin=3 | Try coin=4 | dp[amount] |\n|--------|-----------|-----------|-----------|-----------|\n| 0 | — | — | — | **0** (base) |\n| 1 | dp[0]+1 = 1 | too big | too big | **1** |\n| 2 | dp[1]+1 = 2 | too big | too big | **2** |\n| 3 | dp[2]+1 = 3 | dp[0]+1 = 1 | too big | **1** |\n| 4 | dp[3]+1 = 2 | dp[1]+1 = 2 | dp[0]+1 = 1 | **1** |\n| 5 | dp[4]+1 = 2 | dp[2]+1 = 3 | dp[1]+1 = 2 | **2** |\n| 6 | dp[5]+1 = 3 | dp[3]+1 = 2 | dp[2]+1 = 3 | **2** |\n\n**Result:** `dp[6] = 2` — use coins [3, 3]. ✓\n\n### Tracing the Solution\n\nTo find which coins were used, backtrack from `dp[6]`:\n- `dp[6] = 2`. Which coin led here? Try coin=3: `dp[6-3] = dp[3] = 1 = dp[6]-1`. ✓ Use coin 3.\n- `dp[3] = 1`. Which coin? Try coin=3: `dp[3-3] = dp[0] = 0 = dp[3]-1`. ✓ Use coin 3.\n- `dp[0] = 0`. Done!\n\n**Coins used: [3, 3]** ✓\n\n### Key Insight\n\nThe coin change problem demonstrates the classic DP pattern of **trying all choices at each state** and taking the minimum. The recurrence `dp[a] = min(dp[a - coin] + 1)` says: to make amount `a`, try using each coin and see which gives the fewest total coins. This is fundamentally different from greedy (which would always pick the largest coin first and might fail).',
      },
      {
        heading: 'DP Patterns & Space Optimization',
        content:
          '### Major DP Patterns\n\n**1D DP** — State depends on previous elements in a sequence.\n- Fibonacci, Climbing Stairs, House Robber, Coin Change, Word Break.\n- Often optimizable to O(1) space with rolling variables.\n\n**2D DP** — State depends on two dimensions (two strings, grid position, items + capacity).\n- LCS, Edit Distance, Unique Paths, Knapsack.\n- Often optimizable to O(n) space by keeping only the previous row.\n\n**Interval DP** — Problems on contiguous ranges `[i, j]`.\n- Matrix Chain Multiplication, Burst Balloons, Palindrome Partitioning.\n- Fill the table diagonally (by interval length).\n\n**DP on Trees** — Combine results from child subtrees.\n- Tree Diameter, House Robber III, Binary Tree Maximum Path Sum.\n- Usually solved with post-order DFS returning values upward.\n\n**Bitmask DP** — State is a subset represented as a bitmask.\n- Travelling Salesman, Assign Tasks, Set Cover.\n- `dp[mask]` where `mask` is a binary number representing which elements are included.\n\n### Space Optimization Techniques\n\n**Rolling Array:** If `dp[i]` only depends on `dp[i-1]`, keep just two rows:\n\n```python\n# 2D DP space optimization: LCS with O(n) space\ndef lcs_optimized(text1, text2):\n    m, n = len(text1), len(text2)\n    prev = [0] * (n + 1)\n    for i in range(1, m + 1):\n        curr = [0] * (n + 1)\n        for j in range(1, n + 1):\n            if text1[i-1] == text2[j-1]:\n                curr[j] = prev[j-1] + 1\n            else:\n                curr[j] = max(prev[j], curr[j-1])\n        prev = curr\n    return prev[n]\n```\n\n**Single Row with reverse iteration for knapsack:**\n\n```python\n# 0/1 Knapsack with O(capacity) space\ndef knapsack_optimized(weights, values, capacity):\n    dp = [0] * (capacity + 1)\n    for i in range(len(weights)):\n        for w in range(capacity, weights[i] - 1, -1):\n            dp[w] = max(dp[w], dp[w - weights[i]] + values[i])\n    return dp[capacity]\n```',
      },
      {
        heading: 'Common Interview Problems & Solution Approaches',
        content:
          '### Easy\n- **Climbing Stairs** (LeetCode 70) — `dp[i] = dp[i-1] + dp[i-2]`. O(n) time, O(1) space.\n- **Min Cost Climbing Stairs** (LeetCode 746) — Same pattern with costs. O(n).\n- **Maximum Subarray** (LeetCode 53) — Kadane’s algorithm (DP perspective). O(n).\n\n### Medium\n- **House Robber** (LeetCode 198) — `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`. O(n) time, O(1) space.\n- **Coin Change** (LeetCode 322) — 1D DP over amount. O(amount * coins).\n- **Longest Increasing Subsequence** (LeetCode 300) — O(n²) DP or O(n log n) with binary search.\n- **Longest Common Subsequence** (LeetCode 1143) — 2D DP. O(m * n).\n- **Word Break** (LeetCode 139) — `dp[i]` = can we segment `s[0..i]`? O(n²).\n- **Unique Paths** (LeetCode 62) — Grid DP. O(m * n).\n- **Decode Ways** (LeetCode 91) — 1D DP considering 1-digit and 2-digit decodings. O(n).\n- **Partition Equal Subset Sum** (LeetCode 416) — 0/1 Knapsack variant. O(n * sum).\n- **Target Sum** (LeetCode 494) — Knapsack with offset. O(n * sum).\n\n### Hard\n- **Edit Distance** (LeetCode 72) — 2D DP with 3 operations. O(m * n).\n- **Burst Balloons** (LeetCode 312) — Interval DP. O(n³).\n- **Regular Expression Matching** (LeetCode 10) — 2D DP on pattern and string. O(m * n).\n- **Longest Valid Parentheses** (LeetCode 32) — Stack or DP. O(n).\n\n### Interview Tips\n\n1. **Start with brute-force recursion** — draw the recursion tree and identify repeated subproblems.\n2. **Add memoization first** — converting to top-down DP is mechanical.\n3. **Convert to bottom-up** if the interviewer asks for space optimization.\n4. **Define the state clearly** — this is the hardest part. If stuck, try different state definitions.\n5. **Check your base cases** — most DP bugs come from incorrect initialization.',
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
      'Recursion is the technique of solving a problem by breaking it into smaller instances of itself — each function call handles one piece and delegates the rest to a recursive call. Backtracking extends recursion by systematically exploring all possible candidates for a solution: at each step, we make a choice, recurse to explore the consequences, and if the choice leads to a dead end, we undo it (backtrack) and try the next option. Together, recursion and backtracking form the foundation for solving combinatorial problems — generating all permutations, combinations, and subsets, placing N queens on a chessboard, solving Sudoku puzzles, and navigating mazes. These techniques underpin some of the most elegant algorithmic solutions and appear frequently in coding interviews. In this deep-dive, we examine how the call stack powers recursion, implement recursive and backtracking solutions in four languages, trace through worked examples step by step, and study pruning techniques that transform exponential brute-force into practical algorithms.',
    sections: [
      {
        heading: 'Recursion Fundamentals & The Call Stack',
        content:
          '### The Three Components of Every Recursive Function\n\n1. **Base case** — the condition that stops recursion and returns a known value.\n2. **Recursive case** — the function calls itself with a smaller or simpler input.\n3. **Progress toward the base case** — each recursive call must bring us closer to the base case to avoid infinite recursion.\n\n### How the Call Stack Works\n\nEvery function call pushes a **stack frame** onto the call stack, containing the function’s local variables and return address. When the function returns, its frame is popped.\n\n```\nfactorial(4):\n    Call stack:     factorial(4)\n                    factorial(3)\n                    factorial(2)\n                    factorial(1) ← base case, returns 1\n                    factorial(2) returns 2 * 1 = 2\n                    factorial(3) returns 3 * 2 = 6\n                    factorial(4) returns 4 * 6 = 24\n```\n\n### Stack Overflow\n\nIf recursion is too deep (e.g., `factorial(100000)` without tail-call optimization), the call stack runs out of space and throws a **stack overflow** error. Default limits:\n- Python: ~1000 frames (configurable with `sys.setrecursionlimit`).\n- Java: depends on JVM stack size (typically ~5000-10000 frames).\n- C++: depends on OS stack size (typically ~1MB).\n\n### Recursion vs. Iteration\n\nEvery recursive solution can be converted to an iterative one (using an explicit stack). Choose recursion when:\n- The problem is **naturally recursive** (trees, graphs, divide-and-conquer).\n- The code is significantly cleaner and the recursion depth is bounded.\n\nChoose iteration when:\n- You need to avoid stack overflow for large inputs.\n- You need maximum performance (no function call overhead).',
      },
      {
        heading: 'Writing Recursive Functions in Four Languages',
        content:
          '### Factorial — The Classic Example\n\n```python\n# Python — Factorial\ndef factorial(n):\n    if n <= 1: return 1\n    return n * factorial(n - 1)\n```\n\n```java\n// Java — Factorial\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n```\n\n```javascript\n// JavaScript — Factorial\nfunction factorial(n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n```\n\n```cpp\n// C++ — Factorial\nint factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}\n```\n\n### Power Function — Divide and Conquer\n\nCompute `x^n` in O(log n) by splitting: `x^n = (x^(n/2))^2`.\n\n```python\n# Python — Fast power\ndef power(x, n):\n    if n == 0: return 1\n    if n < 0: return 1 / power(x, -n)\n    half = power(x, n // 2)\n    if n % 2 == 0:\n        return half * half\n    else:\n        return half * half * x\n```\n\n### Linked List Reversal — Recursive\n\n```python\n# Python — Reverse linked list recursively\ndef reverse(head):\n    if not head or not head.next:\n        return head\n    new_head = reverse(head.next)\n    head.next.next = head\n    head.next = None\n    return new_head\n```\n\n### Tree Traversal — Recursion’s Natural Home\n\n```python\n# Python — In-order traversal\ndef inorder(root):\n    if not root: return\n    inorder(root.left)\n    print(root.val)\n    inorder(root.right)\n```\n\n### Key Patterns\n\nRecursive functions typically follow one of these patterns:\n- **Linear recursion**: one recursive call (factorial, linked list operations).\n- **Binary recursion**: two recursive calls (tree traversals, Fibonacci).\n- **Multiple recursion**: more than two calls (generating combinations, backtracking).',
      },
      {
        heading: 'The Backtracking Template in Four Languages',
        content:
          'Backtracking follows the **choose → explore → unchoose** pattern. At each step, we try a choice, recurse with that choice made, then undo it to try the next option.\n\n### The Universal Template\n\n```python\n# Python — Backtracking template\ndef backtrack(result, current, choices):\n    if is_complete(current):\n        result.append(current[:])  # save a copy\n        return\n    for choice in choices:\n        if is_valid(choice, current):\n            current.append(choice)           # choose\n            backtrack(result, current, choices)  # explore\n            current.pop()                    # unchoose\n```\n\n```java\n// Java — Backtracking template\nvoid backtrack(List<List<Integer>> result, List<Integer> current, int[] choices) {\n    if (isComplete(current)) {\n        result.add(new ArrayList<>(current));\n        return;\n    }\n    for (int choice : choices) {\n        if (isValid(choice, current)) {\n            current.add(choice);\n            backtrack(result, current, choices);\n            current.remove(current.size() - 1);\n        }\n    }\n}\n```\n\n```javascript\n// JavaScript — Backtracking template\nfunction backtrack(result, current, choices) {\n    if (isComplete(current)) {\n        result.push([...current]);\n        return;\n    }\n    for (const choice of choices) {\n        if (isValid(choice, current)) {\n            current.push(choice);\n            backtrack(result, current, choices);\n            current.pop();\n        }\n    }\n}\n```\n\n```cpp\n// C++ — Backtracking template\nvoid backtrack(vector<vector<int>>& result, vector<int>& current, vector<int>& choices) {\n    if (isComplete(current)) {\n        result.push_back(current);\n        return;\n    }\n    for (int choice : choices) {\n        if (isValid(choice, current)) {\n            current.push_back(choice);\n            backtrack(result, current, choices);\n            current.pop_back();\n        }\n    }\n}\n```\n\n### The Decision Tree\n\nVisualize backtracking as a **decision tree** where:\n- Each **node** represents the current state.\n- Each **edge** represents a choice.\n- **Leaf nodes** are complete solutions or dead ends.\n- **Pruning** means skipping entire branches when we know they cannot lead to valid solutions.',
      },
      {
        heading: 'Generating Subsets, Permutations & Combinations',
        content:
          '### Subsets (Power Set) — O(2^n)\n\nGenerate all 2^n subsets of a set. At each element, decide: include it or not.\n\n```python\n# Python — Generate all subsets\ndef subsets(nums):\n    result = []\n    def backtrack(start, current):\n        result.append(current[:])\n        for i in range(start, len(nums)):\n            current.append(nums[i])\n            backtrack(i + 1, current)\n            current.pop()\n    backtrack(0, [])\n    return result\n```\n\n```java\n// Java — Generate all subsets\nList<List<Integer>> subsets(int[] nums) {\n    List<List<Integer>> result = new ArrayList<>();\n    backtrack(result, new ArrayList<>(), nums, 0);\n    return result;\n}\nvoid backtrack(List<List<Integer>> res, List<Integer> curr, int[] nums, int start) {\n    res.add(new ArrayList<>(curr));\n    for (int i = start; i < nums.length; i++) {\n        curr.add(nums[i]);\n        backtrack(res, curr, nums, i + 1);\n        curr.remove(curr.size() - 1);\n    }\n}\n```\n\n### Permutations — O(n!)\n\nGenerate all n! orderings. Use a `used` boolean array to track which elements are already placed.\n\n```python\n# Python — Generate all permutations\ndef permutations(nums):\n    result = []\n    used = [False] * len(nums)\n    def backtrack(current):\n        if len(current) == len(nums):\n            result.append(current[:])\n            return\n        for i in range(len(nums)):\n            if not used[i]:\n                used[i] = True\n                current.append(nums[i])\n                backtrack(current)\n                current.pop()\n                used[i] = False\n    backtrack([])\n    return result\n```\n\n### Combinations — C(n, k)\n\nChoose k elements from n. Similar to subsets but stop when current has k elements.\n\n```python\n# Python — Generate all combinations of k elements\ndef combinations(n, k):\n    result = []\n    def backtrack(start, current):\n        if len(current) == k:\n            result.append(current[:])\n            return\n        for i in range(start, n + 1):\n            current.append(i)\n            backtrack(i + 1, current)\n            current.pop()\n    backtrack(1, [])\n    return result\n```\n\n### Summary Table\n\n| Problem | Time | Space | Key Technique |\n|---------|------|-------|---------------|\n| Subsets | O(2^n) | O(n) depth | Include/exclude each element |\n| Permutations | O(n!) | O(n) depth | Track used elements |\n| Combinations C(n,k) | O(C(n,k)) | O(k) depth | Start index + size limit |',
      },
      {
        heading: 'Worked Example: Generating All Permutations Step by Step',
        content:
          'Let’s trace `permutations([1, 2, 3])` through the backtracking algorithm.\n\n### Decision Tree\n\n```\n                       []\n              /         |         \\\n           [1]         [2]        [3]\n          /   \\       /   \\      /   \\\n       [1,2] [1,3] [2,1] [2,3] [3,1] [3,2]\n         |     |     |     |     |     |\n      [1,2,3] [1,3,2] [2,1,3] [2,3,1] [3,1,2] [3,2,1]\n```\n\n### Detailed Trace\n\n| Step | Action | current | used | Result |\n|------|--------|---------|------|--------|\n| 1 | Choose 1 | [1] | [T,F,F] | |\n| 2 | Choose 2 | [1,2] | [T,T,F] | |\n| 3 | Choose 3 | [1,2,3] | [T,T,T] | Save [1,2,3] |\n| 4 | Unchoose 3 | [1,2] | [T,T,F] | |\n| 5 | Unchoose 2 | [1] | [T,F,F] | |\n| 6 | Choose 3 | [1,3] | [T,F,T] | |\n| 7 | Choose 2 | [1,3,2] | [T,T,T] | Save [1,3,2] |\n| 8 | Unchoose 2 | [1,3] | [T,F,T] | |\n| 9 | Unchoose 3 | [1] | [T,F,F] | |\n| 10 | Unchoose 1 | [] | [F,F,F] | |\n| 11 | Choose 2 | [2] | [F,T,F] | |\n| ... | (continue similarly) | ... | ... | ... |\n\n**Final result:** `[[1,2,3], [1,3,2], [2,1,3], [2,3,1], [3,1,2], [3,2,1]]` — all 3! = 6 permutations.\n\n### The Key Insight\n\nAt each level of the decision tree, we try every unused element. The `used` array prevents using the same element twice in one permutation. After exploring all permutations starting with a given prefix, we **backtrack** (undo the choice) and try the next option. This systematic exploration guarantees we find every permutation exactly once.',
      },
      {
        heading: 'Worked Example: N-Queens Step by Step',
        content:
          'Place 4 queens on a 4x4 board so no two queens attack each other (same row, column, or diagonal).\n\n### The Approach\n\nPlace queens one row at a time. For each row, try every column. Check if placement is valid (no conflicts with previously placed queens). If valid, move to the next row. If no column works, backtrack.\n\n### Trace\n\n```\nRow 0: Try col 0 → place Q at (0,0)\n  Row 1: Try col 0 → conflict (same col) ✗\n         Try col 1 → conflict (diagonal) ✗\n         Try col 2 → place Q at (1,2)\n    Row 2: All columns conflict!\n    Backtrack! Remove Q from (1,2)\n         Try col 3 → place Q at (1,3)\n    Row 2: Try col 1 → place Q at (2,1)\n      Row 3: All columns conflict!\n      Backtrack! Remove Q from (2,1)\n    Backtrack! Remove Q from (1,3)\n  Backtrack! Remove Q from (0,0)\n\nRow 0: Try col 1 → place Q at (0,1)\n  Row 1: Try col 3 → place Q at (1,3)\n    Row 2: Try col 0 → place Q at (2,0)\n      Row 3: Try col 2 → place Q at (3,2) ✓ SOLUTION!\n```\n\n**Solution 1:**\n```\n. Q . .\n. . . Q\nQ . . .\n. . Q .\n```\n\n### The N-Queens Code\n\n```python\n# Python — N-Queens\ndef solve_n_queens(n):\n    result = []\n    cols = set()\n    diag1 = set()  # row - col\n    diag2 = set()  # row + col\n\n    def backtrack(row, board):\n        if row == n:\n            result.append([\'\'.join(r) for r in board])\n            return\n        for col in range(n):\n            if col in cols or (row-col) in diag1 or (row+col) in diag2:\n                continue\n            cols.add(col)\n            diag1.add(row - col)\n            diag2.add(row + col)\n            board[row][col] = \'Q\'\n            backtrack(row + 1, board)\n            board[row][col] = \'.\'\n            cols.discard(col)\n            diag1.discard(row - col)\n            diag2.discard(row + col)\n\n    board = [[\'.\' for _ in range(n)] for _ in range(n)]\n    backtrack(0, board)\n    return result\n```\n\n### Complexity\n\n- **Time:** O(n!) — at most n choices for the first row, n-1 for the second, etc.\n- **Space:** O(n) for the recursion stack and constraint sets.\n- Pruning (checking conflicts early) dramatically reduces the actual nodes explored.',
      },
      {
        heading: 'Pruning & Optimization Techniques',
        content:
          'Backtracking’s worst-case complexity is often exponential, but **pruning** — eliminating branches early — can make it practical.\n\n### Technique 1: Constraint Checking (Feasibility Pruning)\n\nBefore making a choice, check if it violates any constraint. If so, skip it entirely.\n\n```python\n# N-Queens: check before placing\nif col in cols or (row-col) in diag1 or (row+col) in diag2:\n    continue  # prune this branch\n```\n\n### Technique 2: Sorting for Early Termination\n\nIf choices are sorted, you can break out of the loop early when further choices cannot improve the solution.\n\n```python\n# Combination Sum: skip remaining if too large\ndef combination_sum(candidates, target):\n    candidates.sort()  # sort first!\n    result = []\n    def backtrack(start, current, remaining):\n        if remaining == 0:\n            result.append(current[:])\n            return\n        for i in range(start, len(candidates)):\n            if candidates[i] > remaining:\n                break  # prune: all remaining are too large\n            current.append(candidates[i])\n            backtrack(i, current, remaining - candidates[i])\n            current.pop()\n    backtrack(0, [], target)\n    return result\n```\n\n### Technique 3: Duplicate Skipping\n\nWhen the input contains duplicates and you want unique results, skip duplicate choices at the same level:\n\n```python\n# Subsets II: skip duplicates\ndef subsets_with_dup(nums):\n    nums.sort()\n    result = []\n    def backtrack(start, current):\n        result.append(current[:])\n        for i in range(start, len(nums)):\n            if i > start and nums[i] == nums[i-1]:\n                continue  # skip duplicate at same level\n            current.append(nums[i])\n            backtrack(i + 1, current)\n            current.pop()\n    backtrack(0, [])\n    return result\n```\n\n### Impact of Pruning\n\n| Problem | Without Pruning | With Pruning |\n|---------|----------------|--------------|\n| N-Queens (n=8) | 16,777,216 nodes | ~15,000 nodes |\n| Sudoku | 9^81 possibilities | ~1,000 nodes (typical) |\n| Combination Sum | Exponential | Much smaller in practice |\n\nGood pruning can reduce runtime by **orders of magnitude** — transforming intractable brute force into efficient search.',
      },
      {
        heading: 'Common Interview Problems & Solution Approaches',
        content:
          '### Easy\n- **Power of Three** (LeetCode 326) — Simple recursion or math.\n- **Fibonacci Number** (LeetCode 509) — Base recursion example. O(n) with memoization.\n\n### Medium\n- **Subsets** (LeetCode 78) — Backtracking with start index. O(2^n).\n- **Permutations** (LeetCode 46) — Backtracking with used array. O(n!).\n- **Combinations** (LeetCode 77) — Backtracking with start index and size limit. O(C(n,k)).\n- **Combination Sum** (LeetCode 39) — Backtracking allowing reuse. Prune by sorting.\n- **Combination Sum II** (LeetCode 40) — Backtracking without reuse, skip duplicates.\n- **Letter Combinations of Phone Number** (LeetCode 17) — Backtracking with digit-to-letter mapping.\n- **Word Search** (LeetCode 79) — DFS/backtracking on a 2D grid. O(m*n * 4^L).\n- **Generate Parentheses** (LeetCode 22) — Backtracking with open/close count constraints.\n- **Palindrome Partitioning** (LeetCode 131) — Backtracking trying every possible cut. O(n * 2^n).\n- **Subsets II** (LeetCode 90) — Backtracking with duplicate skipping. O(2^n).\n- **Permutations II** (LeetCode 47) — Backtracking with duplicate skipping. O(n!).\n\n### Hard\n- **N-Queens** (LeetCode 51) — Row-by-row placement with column/diagonal constraints. O(n!).\n- **Sudoku Solver** (LeetCode 37) — Cell-by-cell backtracking with row/col/box constraints.\n- **Word Search II** (LeetCode 212) — Backtracking + Trie for prefix pruning.\n\n### Interview Tips\n\n1. **Draw the decision tree first** — understand the branching structure before coding.\n2. **Identify what varies at each step** — this determines your choices and loop.\n3. **Always make a copy** when saving a solution: `result.append(current[:])` not `result.append(current)`.\n4. **Undo every choice** — forgetting to unchoose is the most common backtracking bug.\n5. **Think about pruning** — after getting the basic solution working, ask how you can skip invalid branches earlier.\n6. **Know when recursion depth is a concern** — for very deep recursion (>1000 levels), consider iterative alternatives.',
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
