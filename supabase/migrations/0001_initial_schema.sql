-- Initial Schema for VTU SportsOS Phase 1

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Events (Athletics Meets)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, active, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Venues
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- track, field, court
    capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Accommodations (Hostels, Hotels)
CREATE TABLE IF NOT EXISTS accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- hostel, hotel, guesthouse
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Profiles (Athletes, Coaches, Officials, Admins)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- References auth.users if auth is used
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- athlete, coach, official, admin
    college_name VARCHAR(255),
    gender VARCHAR(10),
    accommodation_id UUID REFERENCES accommodations(id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    chest_number VARCHAR(50) UNIQUE,
    arrival_status VARCHAR(50) DEFAULT 'not_started', -- not_started, on_transit, arrived, checked_in
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policies can be added later as authentication is integrated.
