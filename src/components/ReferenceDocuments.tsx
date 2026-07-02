import React from "react";
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { FileText } from "lucide-react";
import { Process } from "../types";

interface ReferenceDocumentsProps {
  processes: Process[];
  process: Process;
  onSaveProcess: (updatedProcess: Process) => void;
}

export default function ReferenceDocuments({ processes, process, onSaveProcess }: ReferenceDocumentsProps) {
  const toggleReference = (refProcess: Process) => {
    const isSelected = process.referencesList?.some(r => r.code === refProcess.code);
    let newReferencesList = process.referencesList ? [...process.referencesList] : [];
    
    if (isSelected) {
      newReferencesList = newReferencesList.filter(r => r.code !== refProcess.code);
    } else {
      newReferencesList.push({ name: refProcess.name, code: refProcess.code });
    }
    
    onSaveProcess({
      ...process,
      referencesList: newReferencesList
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Chọn tài liệu tham khảo từ danh sách</Typography>
      <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <FormGroup>
          {processes.filter(p => p.id !== process.id).map((p) => (
            <FormControlLabel
              key={p.id}
              control={
                <Checkbox 
                  checked={process.referencesList?.some(r => r.code === p.code) || false}
                  onChange={() => toggleReference(p)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileText size={16} />
                  <Typography variant="body2">{p.code} - {p.name}</Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>
      </Paper>
    </Box>
  );
}
