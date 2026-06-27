-- AlterTable: Make fromAgentId nullable to support system messages (no sender agent)
ALTER TABLE "agent_messages" ALTER COLUMN "fromAgentId" DROP NOT NULL;

-- Drop and recreate the foreign key constraint to allow NULL values
ALTER TABLE "agent_messages" DROP CONSTRAINT IF EXISTS "agent_messages_fromAgentId_fkey";
ALTER TABLE "agent_messages" ADD CONSTRAINT "agent_messages_fromAgentId_fkey" FOREIGN KEY ("fromAgentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
