import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import {
  GitBranch,
  BookOpen,
  FileCheck2,
  FileSpreadsheet,
  Settings,
  History,
  Printer
} from "lucide-react";
import WorkflowBuilder from "./WorkflowBuilder";
import ProcessGeneralInfo from "./ProcessGeneralInfo";
import ProcessChangelog from "./ProcessChangelog";
import PublishDocument from "./PublishDocument";
import ReferenceDocuments from "./ReferenceDocuments";
import FormManager from "./FormManager";
import { Process, DynamicForm, ChangelogItem } from "../types";

interface ProcessDashboardProps {
  processes: Process[];
  process: Process | undefined;
  forms: DynamicForm[];
  onSaveProcess: (updatedProcess: Process) => void;
  onUpdateProcessStatus: (
    id: string,
    newStatus: Process["status"],
    reviewComments?: string,
    updatedChangelog?: ChangelogItem[],
  ) => void;
  onSaveForms: (updatedForms: DynamicForm[]) => void;
  currentUserRole: string;
  companyName?: string;
}

export default function ProcessDashboard({
  processes,
  process,
  forms,
  onSaveProcess,
  onUpdateProcessStatus,
  onSaveForms,
  currentUserRole,
  companyName = "CÔNG TY TNHH MTV SEN VÀNG VIỆT NAM",
}: ProcessDashboardProps) {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  if (!process) {
    return (
      <Box sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
        <Typography>Vui lòng chọn một quy trình để xem chi tiết.</Typography>
      </Box>
    );
  }

  const statusColors = {
    draft: { color: "primary", label: "Bản Nháp" },
    pending: { color: "warning", label: "Chờ Phê Duyệt" },
    active: { color: "success", label: "Đang Hiệu Lực" },
    expired: { color: "default", label: "Hết Hiệu Lực" },
  };

  const statusInfo = statusColors[process.status] || statusColors.draft;

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2 }}
    >
      {/* Header Process Info */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {process.name}
            </Typography>
            <Chip
              label={statusInfo.label}
              color={statusInfo.color as any}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Mã: <strong>{process.code}</strong> • Phòng ban:{" "}
            <strong>{process.department}</strong> • Cập nhật lần cuối:{" "}
            <strong>{process.publishDate || "Chưa cập nhật"}</strong>
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            Mức độ hoàn thiện
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            {process.completionRate}%
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                minHeight: 56,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.9rem",
              },
            }}
          >
            <Tab
              icon={<BookOpen size={18} />}
              iconPosition="start"
              label="Thông Tin Chung"
            />
            <Tab
              icon={<GitBranch size={18} />}
              iconPosition="start"
              label="Thiết Kế Lưu Đồ"
            />
            <Tab
              icon={<FileSpreadsheet size={18} />}
              iconPosition="start"
              label="Biểu Mẫu"
            />
            <Tab
              icon={<History size={18} />}
              iconPosition="start"
              label="Phiên Bản"
            />
            <Tab
              icon={<Printer size={18} />}
              iconPosition="start"
              label="In & Ban Hành"
            />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: "auto", p: 2, bgcolor: "#f8fafc" }}>
          {tabIndex === 0 && (
            <ProcessGeneralInfo
              processes={processes}
              process={process}
              onSaveProcess={onSaveProcess}
              currentUserRole={currentUserRole}
            />
          )}
          {tabIndex === 1 && (
            <WorkflowBuilder
              process={process}
              forms={forms}
              onSaveProcess={onSaveProcess}
              currentUserRole={currentUserRole}
            />
          )}
          {tabIndex === 2 && (
            <FormManager
              forms={forms}
              onSaveForms={onSaveForms}
              currentUserRole={currentUserRole}
            />
          )}
          {tabIndex === 3 && (
            <ProcessChangelog
              process={process}
              onSaveProcess={onSaveProcess}
              currentUserRole={currentUserRole}
            />
          )}
          {tabIndex === 4 && (
            <PublishDocument
              process={process}
              onUpdateProcessStatus={onUpdateProcessStatus}
              currentUserRole={currentUserRole}
              companyName={companyName}
            />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
