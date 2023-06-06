<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="任务名称" prop="taskName">
        <el-input
          v-model="queryParams.taskName"
          placeholder="请输入任务名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="任务状态" prop="taskState">
        <el-select v-model="queryParams.taskState" placeholder="请选择任务状态" clearable>
          <el-option
            v-for="dict in dict.type.task_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="截止时间" prop="deadline">
        <el-date-picker clearable
          v-model="queryParams.deadline"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择截止时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="数据集名称" prop="datasetName">
        <el-select v-model="queryParams.datasetName" placeholder="请选择数据集名称" clearable>
          <el-option
            v-for="item in datasets"
            :key="item.dataset_name"
            :label="item.dataset_name"
            :value="item.dataset_name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标注团队名称" prop="teamName">
        <el-select v-model="queryParams.teamName" placeholder="请选择标注团队名称" clearable>
          <el-option
            v-for="item in teams"
            :key="item.team_name"
            :label="item.team_name"
            :value="item.team_name"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['task:task:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['task:task:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['task:task:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['task:task:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务名称" align="center" prop="taskName" />
      <el-table-column label="任务状态" align="center" prop="taskState">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.task_type" :value="scope.row.taskState"/>
        </template>
      </el-table-column>
      <el-table-column label="数据集名称" align="center" prop="datasetName"/>
      <el-table-column label="标注团队名称" align="center" prop="teamName" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="截止时间" align="center" prop="deadline" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.deadline, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['task:task:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleNotation(scope.row)"
          >去标注</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['task:task:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加标注任务对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务状态" prop="taskState">
          <el-select v-model="form.taskState" placeholder="请选择任务状态">
            <el-option
              v-for="dict in dict.type.task_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker clearable
            v-model="form.deadline"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择截止时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="数据集名称" prop="datasetName">
          <el-select v-model="form.datasetName" placeholder="请选择数据集">
            <el-option
              v-for="item in datasets"
              :key="item.dataset_name"
              :label="item.dataset_name"
              :value="item.dataset_name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="标注团队名称" prop="teamName">
          <el-select v-model="form.teamName" placeholder="请选择标注团队">
            <el-option
              v-for="item in teams"
              :key="item.team_name"
              :label="item.team_name"
              :value="item.team_name"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改标注任务对话框 -->
    <el-dialog :title="title" :visible.sync="change_open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="任务状态" prop="taskState">
          <el-select v-model="form.taskState" placeholder="请选择任务状态">
            <el-option
              v-for="dict in dict.type.task_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker clearable
                          v-model="form.deadline"
                          type="date"
                          value-format="yyyy-MM-dd"
                          placeholder="请选择截止时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormChange">确 定</el-button>
        <el-button @click="cancelChange">取 消</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listTask, getTask, delTask, addTask, updateTask } from "@/api/task/task";
import {listDataset} from "@/api/dataset/dataset";
import {listTeam} from "@/api/team/team";

export default {
  name: "Task",
  dicts: ['task_type'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 标注任务表格数据
      taskList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否显示修改对话框
      change_open:false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        taskName: null,
        taskState: null,
        deadline: null,
        datasetId: null,
        datasetName: null,
        teamId: null,
        teamName: null,
        createBy: null,
        createTime: null,
      },
      // 表单参数
      form: {},
      // 数据集列表
      datasets:[],
      // 数据集字典
      datasetDict:{},
      // 标注团队列表
      teams:[],
      // 标注团队字典
      teamDict:{},
      // 表单校验
      rules: {
        taskName: [
          { required: true, message: "任务名称不能为空", trigger: "blur" }
        ],
        datasetName: [
          { required: true, message: "未选择要标注的数据集！", trigger: "blur" }
        ],
        teamName: [
          { required: true, message: "未选择标注团队！", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询标注任务列表 */
    getList() {
      this.loading = true;
      // console.log("before", this.datasets);
      console.log("before", this.queryParams);
      let condition1 = this.datasets === undefined || this.datasets.length <= 0;
      let condition2 = this.teams === undefined || this.teams.length <= 0
      console.log("查询条件",this.queryParams);
      if(condition1||condition2){
        console.log("in", this.datasets);
        let dataset_param = {
          'sysUserDataset.userId': this.$store.getters.id,
        }
        listDataset(dataset_param).then(response => {
          let datasets = response.rows
          datasets.forEach(dataset => {
            let item = {
              dataset_id:dataset.datasetId,
              dataset_name:dataset.datasetName
            }
            this.datasetDict[dataset.datasetName]=dataset.datasetId
            this.datasets.push(item)
          })
          console.log(this.datasets);
          console.log(this.datasetDict);
          // 查找标注团队列表（v1 尚未与用户关联）
          listTeam({}).then(res => {
            res.rows.forEach(team => {
              let item = {
                team_id:team.teamId,
                team_name:team.teamName
              }
              this.teamDict[team.teamName]=team.teamId
              this.teams.push(item)
            })
            console.log(this.teams);
            console.log(this.teamDict);

            listTask(this.queryParams).then(resp => {
              console.log("任务", resp);
              this.taskList = resp.rows;
              this.total = resp.total;
              this.loading = false;
            });
          });
        });
      }
      else {
        listTask(this.queryParams).then(resp => {
          console.log("任务", resp);
          this.taskList = resp.rows;
          this.total = resp.total;
          this.loading = false;
        });
      }


    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮
    cancelChange() {
      this.change_open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        taskId: null,
        taskName: null,
        taskState: null,
        deadline: null,
        datasetId: null,
        datasetName: null,
        teamId: null,
        teamName: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        remark: null,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.taskId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加标注任务";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const taskId = row.taskId || this.ids
      getTask(taskId).then(response => {
        this.form = response.data;
        this.change_open = true;
        this.title = "修改标注任务";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.form.datasetId=this.datasetDict[this.form.datasetName];
      this.form.teamId=this.teamDict[this.form.teamName];
      console.log(this.form);
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.taskId != null) {
            console.log("进入新增对话框却想要修改");
          } else {
            addTask(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },

    submitFormChange(){
      this.form.datasetId=this.datasetDict[this.form.datasetName];
      this.form.teamId=this.teamDict[this.form.teamName];
      console.log(this.form);
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.taskId != null) {
            updateTask(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.change_open = false;
              this.getList();
            });
          } else {
            console.log("进入修改对话框却想要新增");
          }
        }
      });
    },
    /** 去标注 */
    handleNotation(row){
      this.$router.push({path: '/data', query:{
          dataset_id:row.datasetId
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const taskIds = row.taskId || this.ids;
      this.$modal.confirm('是否确认删除标注任务编号为"' + taskIds + '"的数据项？').then(function() {
        return delTask(taskIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('task/task/export', {
        ...this.queryParams
      }, `task_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
