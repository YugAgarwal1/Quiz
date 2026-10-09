import db from '../config/db.js';

export function seedOtherSemesters() {
  console.log('[Seed] Populating subjects, chapters, and questions for Sem VII, Sem VIII, and Sem IX...');

  // Get semester IDs
  const sem7 = db.get("SELECT id FROM semesters WHERE code = 'SEM_VII' OR name = 'Sem VII'");
  const sem8 = db.get("SELECT id FROM semesters WHERE code = 'SEM_VIII' OR name = 'Sem VIII'");
  const sem9 = db.get("SELECT id FROM semesters WHERE code = 'SEM_IX' OR name = 'Sem IX'");

  if (!sem7 || !sem8 || !sem9) {
    console.error('[Seed] Error: Semesters not found. Please ensure semesters table is populated.');
    return;
  }

  const subjectsData = [
    // ==========================================
    // SEM VII SUBJECT 1: Cloud Computing & DevOps
    // ==========================================
    {
      semester_id: sem7.id,
      name: 'Cloud Computing & DevOps',
      code: 'CLOUD_DEVOPS',
      description: 'Cloud architecture, Docker, Kubernetes, CI/CD pipelines, and infrastructure as code.',
      icon: 'cloud',
      chapters: [
        {
          chapter_number: 1,
          chapter_name: 'Cloud Architecture & Service Models',
          chapter_description: 'IaaS, PaaS, SaaS, Public/Private clouds, Hypervisors, and Virtualization mechanisms.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'Which cloud computing model provides virtualized computing resources over the internet such as VMs and storage?',
              options: ['IaaS (Infrastructure as a Service)', 'PaaS (Platform as a Service)', 'SaaS (Software as a Service)', 'FaaS (Function as a Service)'],
              answer: 'IaaS (Infrastructure as a Service)',
              solution: 'IaaS provides raw infrastructure like virtual machines, networking, and block storage.'
            },
            {
              difficulty: 'Easy',
              question: 'What is the primary characteristic of a Multi-Tenant cloud architecture?',
              options: ['Single physical hardware shared securely by multiple customers', 'Dedicated isolated server per customer', 'Zero internet connectivity', 'Only runs on bare metal machines'],
              answer: 'Single physical hardware shared securely by multiple customers',
              solution: 'Multi-tenancy allows cloud providers to serve multiple tenants on shared physical infrastructure.'
            },
            {
              difficulty: 'Medium',
              question: 'Which hypervisor type runs directly on the host hardware without an underlying operating system?',
              options: ['Type 1 (Bare-Metal) Hypervisor', 'Type 2 (Hosted) Hypervisor', 'Container Runtime Engine', 'JVM Bytecode Engine'],
              answer: 'Type 1 (Bare-Metal) Hypervisor',
              solution: 'Type 1 hypervisors (like VMware ESXi, KVM, Xen) run directly on the physical hardware.'
            },
            {
              difficulty: 'Hard',
              question: 'In cloud elasticity calculations, what metric prevents the "flapping" oscillation of auto-scaling instances during bursty traffic?',
              options: ['Cooldown Period (Cooldown timer)', 'Horizontal Pod Autoscaler target', 'Round Robin weight', 'TTL heartbeat'],
              answer: 'Cooldown Period (Cooldown timer)',
              solution: 'Cooldown periods ensure auto-scaling groups do not repeatedly launch or terminate instances before previous scaling events take effect.'
            }
          ]
        },
        {
          chapter_number: 2,
          chapter_name: 'Docker & Containerization',
          chapter_description: 'Container runtimes, Dockerfile optimization, multi-stage builds, and container networking.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'Which Linux kernel features form the fundamental isolation barrier for Docker containers?',
              options: ['Namespaces and Cgroups (Control Groups)', 'Systemd and Init.d', 'Cron and Syslog', 'PAM and OpenSSH'],
              answer: 'Namespaces and Cgroups (Control Groups)',
              solution: 'Namespaces provide process/network isolation, while Cgroups limit and monitor resource usage (CPU/RAM).'
            },
            {
              difficulty: 'Medium',
              question: 'What is the primary benefit of multi-stage Docker builds?',
              options: ['Significantly reduced final image size by discarding build tools', 'Accelerated CPU clock speed', 'Automatic database backup', 'Elimination of TLS certificates'],
              answer: 'Significantly reduced final image size by discarding build tools',
              solution: 'Multi-stage builds allow compiling in an intermediate stage and copying only compiled artifacts into a lightweight production runtime image.'
            },
            {
              difficulty: 'Hard',
              question: 'Which Docker network driver enables containers across different Docker daemon hosts to communicate without host-level routing?',
              options: ['Overlay Network', 'Bridge Network', 'Host Network', 'Macvlan in bridge mode'],
              answer: 'Overlay Network',
              solution: 'Overlay networks create a distributed network among multiple Docker daemon hosts, commonly utilized in Swarm and Kubernetes.'
            }
          ]
        },
        {
          chapter_number: 3,
          chapter_name: 'Kubernetes Orchestration',
          chapter_description: 'Pods, Deployments, ReplicaSets, Services, ConfigMaps, and Ingress controllers.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'What is the smallest deployable computing unit in Kubernetes?',
              options: ['Pod', 'Container', 'ReplicaSet', 'Node'],
              answer: 'Pod',
              solution: 'A Pod represents a single instance of a running process in a cluster and encapsulates one or more containers.'
            },
            {
              difficulty: 'Medium',
              question: 'Which Kubernetes Service type exposes the Service externally using a cloud provider load balancer?',
              options: ['LoadBalancer', 'ClusterIP', 'NodePort', 'ExternalName'],
              answer: 'LoadBalancer',
              solution: 'LoadBalancer provision a cloud network load balancer that forwards external traffic to NodePorts and ClusterIP.'
            },
            {
              difficulty: 'Hard',
              question: 'Which component in the Kubernetes Control Plane acts as the consistent and highly-available key-value data store for all cluster data?',
              options: ['etcd', 'kube-scheduler', 'kube-apiserver', 'kubelet'],
              answer: 'etcd',
              solution: 'etcd is a distributed, consistent key-value store used as Kubernetes backing store for all cluster configurations and states.'
            }
          ]
        }
      ]
    },

    // ==========================================
    // SEM VII SUBJECT 2: Distributed Systems & Microservices
    // ==========================================
    {
      semester_id: sem7.id,
      name: 'Distributed Systems & Microservices',
      code: 'DISTRIBUTED_SYS',
      description: 'Distributed architectures, CAP theorem, gRPC, message queues, and distributed consensus.',
      icon: 'network',
      chapters: [
        {
          chapter_number: 1,
          chapter_name: 'Distributed Systems Foundations & CAP Theorem',
          chapter_description: 'Consistency, Availability, Partition Tolerance, PACELC theorem, and latency trade-offs.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'According to the CAP theorem, what is guaranteed in a distributed data store in the presence of a network partition (P)?',
              options: ['Trade-off between Consistency (C) or Availability (A)', 'Both Consistency and Availability simultaneously', 'Zero latency with infinite scalability', 'Automatic hardware repair'],
              answer: 'Trade-off between Consistency (C) or Availability (A)',
              solution: 'Under a network partition, a distributed system must choose between returning consistent data or remaining available.'
            },
            {
              difficulty: 'Medium',
              question: 'In distributed systems, what is the purpose of Vector Clocks?',
              options: ['Capturing causal relationships between distributed events', 'Measuring CPU clock speed in gigahertz', 'Calculating database disk IOPS', 'Generating random UUIDs'],
              answer: 'Capturing causal relationships between distributed events',
              solution: 'Vector clocks generate partial ordering of events in a distributed system to detect concurrent updates and causal conflicts.'
            },
            {
              difficulty: 'Hard',
              question: 'Which consensus algorithm uses leader election, log replication, and terms to ensure safety and linearizability in distributed state machines?',
              options: ['Raft Consensus Algorithm', 'Dijkstra Shortest Path', 'Round Robin DNS', 'Consistent Hashing Ring'],
              answer: 'Raft Consensus Algorithm',
              solution: 'Raft is an understandable consensus algorithm for managing a replicated log across distributed servers.'
            }
          ]
        },
        {
          chapter_number: 2,
          chapter_name: 'Microservices Communication & Messaging',
          chapter_description: 'Synchronous REST/gRPC vs Asynchronous Event-driven architectures with Apache Kafka & RabbitMQ.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'What binary serialization format does gRPC utilize by default for fast inter-service communication?',
              options: ['Protocol Buffers (Protobuf)', 'JSON', 'XML', 'YAML'],
              answer: 'Protocol Buffers (Protobuf)',
              solution: 'gRPC uses Protocol Buffers for structured binary payload serialization and HTTP/2 transport.'
            },
            {
              difficulty: 'Medium',
              question: 'What design pattern prevents cascading failures across microservices when a downstream service becomes unresponsive?',
              options: ['Circuit Breaker Pattern', 'Singleton Pattern', 'Factory Method Pattern', 'Observer Pattern'],
              answer: 'Circuit Breaker Pattern',
              solution: 'The Circuit Breaker pattern trips open to fail fast when error thresholds are exceeded, preventing system overload.'
            },
            {
              difficulty: 'Hard',
              question: 'In Apache Kafka, what guarantees the strictly ordered processing of messages across consumers?',
              options: ['Messages published to the same Partition with identical Partition Key', 'Broadcasting to all topics', 'Setting replica factor to zero', 'Disabling ZooKeeper/KRaft'],
              answer: 'Messages published to the same Partition with identical Partition Key',
              solution: 'Kafka guarantees total message order strictly within a single partition.'
            }
          ]
        }
      ]
    },

    // ==========================================
    // SEM VIII SUBJECT 1: Artificial Intelligence & Machine Learning
    // ==========================================
    {
      semester_id: sem8.id,
      name: 'AI & Machine Learning',
      code: 'AI_ML',
      description: 'Supervised learning, deep learning neural nets, loss functions, transformers, and model evaluation.',
      icon: 'brain',
      chapters: [
        {
          chapter_number: 1,
          chapter_name: 'Supervised & Unsupervised Learning',
          chapter_description: 'Linear Regression, Logistic Regression, Decision Trees, K-Means Clustering, and PCA.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'Which machine learning algorithm is primarily used for classification problems by estimating probabilities using a sigmoid function?',
              options: ['Logistic Regression', 'Linear Regression', 'K-Means Clustering', 'Principal Component Analysis (PCA)'],
              answer: 'Logistic Regression',
              solution: 'Logistic regression maps real-valued outputs into a probability between 0 and 1 using the sigmoid/logistic function.'
            },
            {
              difficulty: 'Medium',
              question: 'What does a high training accuracy combined with low validation accuracy indicate in a machine learning model?',
              options: ['Overfitting (High Variance)', 'Underfitting (High Bias)', 'Optimal Convergence', 'Zero loss optimum'],
              answer: 'Overfitting (High Variance)',
              solution: 'Overfitting occurs when a model memorizes training noise and fails to generalize to unseen test/validation data.'
            },
            {
              difficulty: 'Hard',
              question: 'What technique in Decision Trees helps prevent overfitting by removing sub-nodes that add little predictive value?',
              options: ['Cost-Complexity Pruning', 'Gradient Clipping', 'Batch Normalization', 'One-Hot Encoding'],
              answer: 'Cost-Complexity Pruning',
              solution: 'Tree pruning reduces tree complexity and variance by pruning redundant branches based on cost complexity.'
            }
          ]
        },
        {
          chapter_number: 2,
          chapter_name: 'Deep Learning & Neural Architectures',
          chapter_description: 'Backpropagation, Activation Functions, Convolutional Neural Networks, and Transformers.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'Which activation function outputs 0 for negative inputs and the input value directly for positive inputs (f(x) = max(0, x))?',
              options: ['ReLU (Rectified Linear Unit)', 'Sigmoid', 'Tanh', 'Softmax'],
              answer: 'ReLU (Rectified Linear Unit)',
              solution: 'ReLU is widely used in deep neural networks because it avoids vanishing gradient problems for positive inputs.'
            },
            {
              difficulty: 'Medium',
              question: 'What mechanism in the Transformer architecture allows the model to weigh the relevance of different words in a sentence simultaneously?',
              options: ['Self-Attention Mechanism', 'Recurrent Hidden State Loop', 'Max Pooling Layer', 'Dropout 0.5'],
              answer: 'Self-Attention Mechanism',
              solution: 'Self-attention calculates query, key, and value vectors to compute contextual relationships across sequence tokens in parallel.'
            },
            {
              difficulty: 'Hard',
              question: 'During backpropagation, why does the Vanishing Gradient problem predominantly occur with deep networks using Sigmoid or Tanh activations?',
              options: ['Their derivatives saturate and are bounded between 0 and 0.25, shrinking exponentially when multiplied by chain rule', 'They cause numeric overflow exceeding float64 limits', 'They produce non-invertible weight matrices', 'They disable backward pass execution'],
              answer: 'Their derivatives saturate and are bounded between 0 and 0.25, shrinking exponentially when multiplied by chain rule',
              solution: 'When multiplying many small derivatives via the chain rule through deep layers, the gradient vanishes towards zero.'
            }
          ]
        }
      ]
    },

    // ==========================================
    // SEM VIII SUBJECT 2: Cyber Security & Cryptography
    // ==========================================
    {
      semester_id: sem8.id,
      name: 'Cyber Security & Cryptography',
      code: 'CYBER_SEC',
      description: 'Symmetric & asymmetric encryption, JWT, OAuth 2.0, OWASP Top 10 vulnerabilities, and network security.',
      icon: 'shield',
      chapters: [
        {
          chapter_number: 1,
          chapter_name: 'Cryptography, Public Key Infrastructure & Hashing',
          chapter_description: 'AES, RSA, ECC, SHA-256, HMAC, digital signatures, and TLS handshakes.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'Which encryption type uses the exact same secret key for both encryption and decryption?',
              options: ['Symmetric Encryption (e.g. AES)', 'Asymmetric Encryption (e.g. RSA)', 'Public-Key Cryptography', 'Diffie-Hellman Key Exchange'],
              answer: 'Symmetric Encryption (e.g. AES)',
              solution: 'Symmetric encryption uses a single shared secret key for both enciphering and deciphering data.'
            },
            {
              difficulty: 'Medium',
              question: 'Why should passwords NEVER be stored using fast hashing algorithms like MD5 or plain SHA-256?',
              options: ['Vulnerable to high-speed brute-force attacks on GPUs and rainbow tables; adaptive algorithms like bcrypt are required', 'MD5 and SHA-256 produce reversible plaintext', 'They cannot hash passwords longer than 8 characters', 'They require hardware security modules'],
              answer: 'Vulnerable to high-speed brute-force attacks on GPUs and rainbow tables; adaptive algorithms like bcrypt are required',
              solution: 'Bcrypt and Argon2 include tunable work factors (salt + cost rounds) specifically designed to be slow and memory-hard.'
            },
            {
              difficulty: 'Hard',
              question: 'In TLS 1.3, how does the Ephemeral Diffie-Hellman (ECDHE) key exchange provide Perfect Forward Secrecy (PFS)?',
              options: ['A new temporary session key pair is generated per session; compromising the server private key cannot decrypt past recorded sessions', 'By encrypting the entire handshake with RSA 4096-bit master keys', 'By reusing the same pre-shared key across all clients', 'By eliminating asymmetric encryption completely'],
              answer: 'A new temporary session key pair is generated per session; compromising the server private key cannot decrypt past recorded sessions',
              solution: 'Perfect Forward Secrecy ensures that compromise of long-term server keys does not compromise past session keys.'
            }
          ]
        },
        {
          chapter_number: 2,
          chapter_name: 'Web Security & OWASP Top 10',
          chapter_description: 'SQL Injection, XSS, CSRF, SSRF, Broken Access Control, and modern security headers.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'What is the most effective defense against SQL Injection vulnerabilities?',
              options: ['Parameterized Queries (Prepared Statements)', 'Client-side HTML form validation', 'Writing SQL in uppercase', 'Storing passwords in plaintext'],
              answer: 'Parameterized Queries (Prepared Statements)',
              solution: 'Parameterized queries ensure user input is treated strictly as literal data, never executable SQL code.'
            },
            {
              difficulty: 'Medium',
              question: 'What HTTP response header protects web applications from Clickjacking attacks by forbidding iframe embedding?',
              options: ['X-Frame-Options: DENY (or CSP frame-ancestors)', 'Access-Control-Allow-Origin: *', 'Strict-Transport-Security', 'Cache-Control: no-cache'],
              answer: 'X-Frame-Options: DENY (or CSP frame-ancestors)',
              solution: 'X-Frame-Options instructs browsers not to render the page inside frames or iframes.'
            },
            {
              difficulty: 'Hard',
              question: 'In a Cross-Site Request Forgery (CSRF) attack, what prevents the attacker from forging authenticated state-changing requests when SameSite=Strict cookies and anti-CSRF tokens are enforced?',
              options: ['The browser omits ambient authentication cookies on cross-origin requests and the attacker cannot guess the cryptographically random token', 'The server blocks all POST requests from mobile browsers', 'The client IP address changes automatically', 'Database transactions are rolled back'],
              answer: 'The browser omits ambient authentication cookies on cross-origin requests and the attacker cannot guess the cryptographically random token',
              solution: 'Anti-CSRF tokens coupled with SameSite cookie policies ensure cross-origin sites cannot invoke authenticated actions.'
            }
          ]
        }
      ]
    },

    // ==========================================
    // SEM IX SUBJECT 1: System Design & Software Architecture
    // ==========================================
    {
      semester_id: sem9.id,
      name: 'System Design & Scalability',
      code: 'SYS_DESIGN',
      description: 'Horizontal scaling, Database Sharding, Caching strategies, Rate limiting, and Real-time streaming.',
      icon: 'server',
      chapters: [
        {
          chapter_number: 1,
          chapter_name: 'High-Level Design & Scaling Strategies',
          chapter_description: 'Load balancing algorithms, Database Sharding, Consistent Hashing, and CDNs.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'What is the key advantage of Horizontal Scaling (Scale Out) over Vertical Scaling (Scale Up)?',
              options: ['Allows adding more commodity machines without strict physical hardware ceilings', 'Requires zero network latency', 'Cheaper motherboard RAM speeds', 'Eliminates database normalization'],
              answer: 'Allows adding more commodity machines without strict physical hardware ceilings',
              solution: 'Horizontal scaling adds more instances to a cluster, avoiding the physical hardware and cost limits of a single massive server.'
            },
            {
              difficulty: 'Medium',
              question: 'In a distributed cache, what caching strategy writes data to the cache and database simultaneously, ensuring strong consistency at the expense of higher write latency?',
              options: ['Write-Through Cache', 'Write-Back (Write-Behind) Cache', 'Cache-Aside (Lazy Loading)', 'Read-Through Cache'],
              answer: 'Write-Through Cache',
              solution: 'Write-Through writes directly to both the cache and underlying database at the same time.'
            },
            {
              difficulty: 'Hard',
              question: 'Why does Consistent Hashing use virtual nodes on a hash ring when distributing data across a cluster?',
              options: ['To ensure uniform load distribution and avoid hot spots when servers have uneven hash distributions', 'To multiply database write speeds by 10x', 'To bypass TCP handshake timeouts', 'To execute SQL transactions across nodes'],
              answer: 'To ensure uniform load distribution and avoid hot spots when servers have uneven hash distributions',
              solution: 'Virtual nodes map each physical node to multiple points on the hash ring, preventing unbalanced key clustering.'
            }
          ]
        },
        {
          chapter_number: 2,
          chapter_name: 'Event-Driven Systems & Real-Time Data',
          chapter_description: 'Pub/Sub models, WebSockets, Change Data Capture (CDC), and Idempotency.',
          questions: [
            {
              difficulty: 'Easy',
              question: 'Which full-duplex protocol maintains a single persistent TCP connection between client and server for instant bi-directional communication?',
              options: ['WebSocket', 'HTTP/1.1 Short Polling', 'FTP', 'SMTP'],
              answer: 'WebSocket',
              solution: 'WebSockets provide persistent, bi-directional, low-latency communication over a single connection.'
            },
            {
              difficulty: 'Medium',
              question: 'What property guarantees that processing the exact same event or API request multiple times produces the identical side-effect as executing it once?',
              options: ['Idempotency', 'Linearizability', 'Atomicity', 'Polymorphism'],
              answer: 'Idempotency',
              solution: 'Idempotency ensures safe retry logic in distributed systems without duplicate charges or duplicate writes.'
            },
            {
              difficulty: 'Hard',
              question: 'In high-throughput event sourcing, what technique captures and aggregates state into pre-computed read models to avoid replaying thousands of past events on every read query?',
              options: ['Snapshotting & CQRS (Command Query Responsibility Segregation)', 'Linear Regression Fitting', 'B-Tree Index Defragmentation', 'Database Flush to Temp Table'],
              answer: 'Snapshotting & CQRS (Command Query Responsibility Segregation)',
              solution: 'Snapshotting saves periodic state checkpoints, while CQRS separates fast read models from event logs.'
            }
          ]
        }
      ]
    }
  ];

  // SQL prepared statements
  const insertSubStmt = db.raw.prepare(`
    INSERT INTO subjects (semester_id, name, code, description, icon)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertChapStmt = db.raw.prepare(`
    INSERT INTO chapters (subject_id, chapter_number, chapter_name, chapter_description)
    VALUES (?, ?, ?, ?)
  `);

  const insertQStmt = db.raw.prepare(`
    INSERT INTO questions (chapter_id, question_text, difficulty, solution_explanation, marks)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertOptStmt = db.raw.prepare(`
    INSERT INTO question_options (question_id, option_index, option_text, is_correct)
    VALUES (?, ?, ?, ?)
  `);

  let addedSubjects = 0;
  let addedChapters = 0;
  let addedQuestions = 0;

  db.exec('BEGIN TRANSACTION;');

  try {
    for (const sub of subjectsData) {
      // Check if subject already exists
      let existingSub = db.get('SELECT id FROM subjects WHERE semester_id = ? AND name = ?', [sub.semester_id, sub.name]);
      let subjectId;

      if (existingSub) {
        subjectId = existingSub.id;
      } else {
        const subRes = insertSubStmt.run(
          sub.semester_id,
          sub.name,
          sub.code,
          sub.description,
          sub.icon
        );
        subjectId = Number(subRes.lastInsertRowid);
        addedSubjects++;
      }

      for (const chap of sub.chapters) {
        let existingChap = db.get('SELECT id FROM chapters WHERE subject_id = ? AND chapter_number = ?', [subjectId, chap.chapter_number]);
        let chapterId;

        if (existingChap) {
          chapterId = existingChap.id;
        } else {
          const chapRes = insertChapStmt.run(
            subjectId,
            chap.chapter_number,
            chap.chapter_name,
            chap.chapter_description
          );
          chapterId = Number(chapRes.lastInsertRowid);
          addedChapters++;
        }

        for (const q of chap.questions) {
          const qRes = insertQStmt.run(
            chapterId,
            q.question,
            q.difficulty,
            q.solution,
            1
          );
          const questionId = Number(qRes.lastInsertRowid);
          addedQuestions++;

          q.options.forEach((optText, optIdx) => {
            const isCorrect = (String(optText).trim() === String(q.answer).trim()) ? 1 : 0;
            insertOptStmt.run(
              questionId,
              optIdx,
              optText,
              isCorrect
            );
          });
        }
      }
    }

    db.exec('COMMIT;');
    console.log(`[Seed Success] Added ${addedSubjects} new Subjects, ${addedChapters} Chapters, and ${addedQuestions} Questions with multiple difficulties across Sem VII, Sem VIII, and Sem IX!`);
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[Seed Error] Failed to populate other semesters:', err);
    throw err;
  }
}

// Run immediately
seedOtherSemesters();
