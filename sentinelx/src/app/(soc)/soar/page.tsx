"use client";

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, RefreshCw, Play, Zap, Activity, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useSOAR } from '@/hooks/use-soar';
import { WorkflowList } from '@/components/soar/workflow-list';
import { WorkflowDetails } from '@/components/soar/workflow-details';
import { ExecutionMonitor } from '@/components/soar/execution-monitor';
import { SOARDashboard } from '@/components/soar/soar-dashboard';
import { WorkflowTrigger, WorkflowStatus } from '@/types/soar';

export default function SOARPage() {
  const {
    workflows,
    executions,
    dashboard,
    selectedWorkflow,
    setSelectedWorkflow,
    isExecuting,
    filter,
    updateFilter,
    clearFilter,
    executeWorkflow,
    createWorkflowFromTemplate,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflow,
    workflowTemplates
  } = useSOAR();

  const [activeTab, setActiveTab] = useState<'workflows' | 'executions' | 'dashboard'>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleWorkflowSelect = useCallback((workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    setSelectedWorkflow(workflow || null);
  }, [workflows, setSelectedWorkflow]);

  const handleWorkflowEdit = useCallback((workflowId: string) => {
    handleWorkflowSelect(workflowId);
  }, [handleWorkflowSelect]);

  const handleWorkflowDelete = useCallback((workflowId: string) => {
    deleteWorkflow(workflowId);
  }, [deleteWorkflow]);

  const handleWorkflowToggle = useCallback((workflowId: string, enabled: boolean) => {
    toggleWorkflow(workflowId, enabled);
  }, [toggleWorkflow]);

  const handleWorkflowSave = useCallback((workflow: any) => {
    updateWorkflow(workflow.id, workflow);
    setSelectedWorkflow(null);
  }, [updateWorkflow, setSelectedWorkflow]);

  const handleCreateFromTemplate = useCallback((templateId: string) => {
    const template = workflowTemplates.find(t => t.id === templateId);
    if (template) {
      createWorkflowFromTemplate(template);
      setShowCreateModal(false);
    }
  }, [workflowTemplates, createWorkflowFromTemplate]);

  const getTriggerColor = (trigger: WorkflowTrigger) => {
    switch (trigger) {
      case 'brute_force': return 'text-orange-400';
      case 'suspicious_login': return 'text-blue-400';
      case 'sql_injection': return 'text-red-400';
      case 'data_exfiltration': return 'text-purple-400';
      case 'malware_detection': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getTriggerIcon = (trigger: WorkflowTrigger) => {
    switch (trigger) {
      case 'brute_force': return '🔓';
      case 'suspicious_login': return '🌍';
      case 'sql_injection': return '💉';
      case 'data_exfiltration': return '📤';
      case 'malware_detection': return '🦠';
      default: return '⚙️';
    }
  };

  return (
    <main className="grid-bg min-h-screen p-6">
      <div className="mx-auto w-full max-w-[1800px] space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold text-green-400">SOAR Automation</h1>
            <p className="mt-1 text-sm text-slate-400">
              Security Orchestration, Automation & Response
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Workflow
            </button>

            <button
              onClick={() => {
                // Refresh logic here
              }}
              className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-green-400 border border-green-500/30 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-1 p-1 glass-neon rounded-xl border border-green-500/30"
        >
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <Activity className="h-4 w-4" /> },
            { id: 'workflows', label: 'Workflows', icon: <Settings className="h-4 w-4" /> },
            { id: 'executions', label: 'Executions', icon: <Clock className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                activeTab === tab.id
                  ? "bg-green-500 text-black"
                  : "text-slate-400 hover:text-green-400"
              )}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SOARDashboard dashboard={dashboard} />
          </motion.div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Filter Bar */}
            <div className="glass-neon rounded-xl border border-green-500/30 p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-green-400">Filter:</span>
                
                <select
                  value={filter.status[0] || ''}
                  onChange={(e) => updateFilter({ status: e.target.value ? [e.target.value as WorkflowStatus] : [] })}
                  className="px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="executing">Executing</option>
                </select>

                <select
                  value={filter.trigger[0] || ''}
                  onChange={(e) => updateFilter({ trigger: e.target.value ? [e.target.value as WorkflowTrigger] : [] })}
                  className="px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                  <option value="">All Triggers</option>
                  <option value="brute_force">Brute Force</option>
                  <option value="suspicious_login">Suspicious Login</option>
                  <option value="sql_injection">SQL Injection</option>
                  <option value="data_exfiltration">Data Exfiltration</option>
                  <option value="malware_detection">Malware Detection</option>
                </select>

                <button
                  onClick={clearFilter}
                  className="px-3 py-2 text-slate-400 hover:text-green-400 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <WorkflowList
              workflows={workflows}
              selectedWorkflowId={selectedWorkflow?.id || null}
              onWorkflowSelect={handleWorkflowSelect}
              onWorkflowEdit={handleWorkflowEdit}
              onWorkflowDelete={handleWorkflowDelete}
              onWorkflowToggle={handleWorkflowToggle}
              onWorkflowExecute={executeWorkflow}
              isExecuting={isExecuting}
            />
          </motion.div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ExecutionMonitor
              executions={executions}
              isLiveMonitoring={true}
            />
          </motion.div>
        )}

        {/* Create Workflow Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-black/90 border border-green-500/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-green-500/20">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-green-400">Create New Workflow</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workflowTemplates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleCreateFromTemplate(template.id)}
                      className="glass-neon rounded-lg border border-green-500/20 p-4 cursor-pointer hover:border-green-500/40 hover:bg-green-500/5 transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getTriggerIcon(template.trigger)}</span>
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{template.name}</h3>
                          <p className="text-xs text-slate-400">{template.category}</p>
                        </div>
                        {template.isRecommended && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-3">{template.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Trigger: {template.trigger.replace('_', ' ').toUpperCase()}</span>
                        <span className={getTriggerColor(template.trigger)}>
                          {template.trigger.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Details Modal */}
        {selectedWorkflow && (
          <WorkflowDetails
            workflow={selectedWorkflow}
            onClose={() => setSelectedWorkflow(null)}
            onSave={handleWorkflowSave}
            onExecute={executeWorkflow}
            isExecuting={isExecuting}
          />
        )}
      </div>
    </main>
  );
}
