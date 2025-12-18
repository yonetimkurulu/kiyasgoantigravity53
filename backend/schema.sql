-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- 1. Main Products Table (The catalog)
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  category text not null, -- 'phone', 'laptop', etc.
  subcategory text,
  brand text,
  specs jsonb, -- Normalized specs { "cpu": "A16", "ram": "8GB" }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Provenance Sources (Where did we find info?)
-- We store the URL and metadata here to link back to the source legally.
create table if not exists provenance_sources (
  id uuid default gen_random_uuid() primary key,
  product_id bigint references products(id) on delete cascade not null,
  source_type text not null, -- 'youtube', 'forum_thread', 'review_article'
  url text not null,
  title text,
  channel_author text, -- Channel name or Forum user (anonymized)
  publish_date timestamp with time zone,
  is_processed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, url)
);

-- 3. Content Chunks (The RAG knowledge base)
-- Stores small text pieces and their vector embeddings.
-- content_text is HIDDEN from the public API, only used for AI context.
create table if not exists content_chunks (
  id uuid default gen_random_uuid() primary key,
  source_id uuid references provenance_sources(id) on delete cascade not null,
  chunk_text text not null, 
  embedding vector(1536), -- OpenAI Ada-002 dimension
  tags text[], -- ['performance', 'battery_life']
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. AI Insights (Cached Results)
-- Stores the generated Pros/Cons/Summary to avoid re-running AI on every request.
create table if not exists ai_insights (
  product_id bigint references products(id) on delete cascade primary key,
  summary_text text,
  pros jsonb, -- ["Screen is bright", "Fast charging"]
  cons jsonb, -- ["Battery drains fast", "Expensive"]
  verdict text, -- "Best for gamers..."
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index on content_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
