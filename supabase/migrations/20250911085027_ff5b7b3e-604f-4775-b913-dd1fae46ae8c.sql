-- Add DELETE policy for pdf_chats table
CREATE POLICY "Users can delete chats for their PDFs" 
ON public.pdf_chats 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1
    FROM pdfs
    WHERE pdfs.id = pdf_chats.pdf_id
    AND pdfs.user_id = auth.uid()
  )
);

-- Add UPDATE policy for pdf_chats table  
CREATE POLICY "Users can update chats for their PDFs"
ON public.pdf_chats
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM pdfs
    WHERE pdfs.id = pdf_chats.pdf_id
    AND pdfs.user_id = auth.uid()
  )
);